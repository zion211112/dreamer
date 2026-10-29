/**
 * Faithful port of the Supabase CLI statement splitter
 * (apps/cli/src/command-internal/sql-split.ts -> splitAndTrim).
 *
 * The migration ledger stores each migration's statements as a text[] array.
 * The CLI writes them with its own splitter, so the array we record must be
 * produced by the same algorithm, otherwise `supabase db diff` / `db pull`
 * would reconstruct a different file than the one on disk.
 */

interface State {
  /** Returns the next state, or `null` to emit a token (statement boundary). */
  next(rune: string, data: string): State | null;
}

const BEGIN_ATOMIC = 'ATOMIC';
const END_ATOMIC = 'END';

const isIdentifierRune = (rune: string): boolean => {
  const codePoint = rune.codePointAt(0);
  return codePoint !== undefined && (codePoint >= 0x80 || /[A-Za-z0-9_$]/u.test(rune));
};

const hasIdentifierRuneBefore = (data: string, offset: number): boolean => {
  if (offset <= 0) return false;
  const rune = Array.from(data.slice(Math.max(0, offset - 2), offset)).at(-1);
  return rune !== undefined && isIdentifierRune(rune);
};

const asciiUpper = (text: string): string => text.replace(/[a-z]/g, (c) => c.toUpperCase());

function endsWithKeyword(data: string, keyword: string): boolean {
  const offset = data.length - keyword.length;
  if (offset < 0 || asciiUpper(data.slice(offset)) !== keyword) return false;
  return !hasIdentifierRuneBefore(data, offset);
}

const isSqlWhitespace = (rune: string): boolean => ' \t\n\r\f\v'.includes(rune);
const isNewline = (rune: string): boolean => rune === '\n' || rune === '\r';

function isBeginAtomic(data: string): boolean {
  if (!endsWithKeyword(data, BEGIN_ATOMIC)) return false;
  let end = data.length - BEGIN_ATOMIC.length;
  while (end > 0 && isSqlWhitespace(data[end - 1]!)) end -= 1;
  return endsWithKeyword(data.slice(0, end), 'BEGIN');
}

function isCommentsAndWhitespace(text: string): boolean {
  let i = 0;
  while (i < text.length) {
    if (isSqlWhitespace(text[i]!)) {
      i += 1;
    } else if (text.startsWith('--', i)) {
      const newline = text.slice(i + 2).search(/[\n\r]/u);
      if (newline === -1) return true;
      i += newline + 3;
    } else if (text.startsWith('/*', i)) {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        const window = text.slice(i - 1, i + 1);
        if (window === '/*') depth += 1;
        else if (window === '*/') depth -= 1;
        i += 1;
      }
      if (depth > 0) return true;
    } else {
      return false;
    }
  }
  return true;
}

class ReadyState implements State {
  next(rune: string, data: string): State | null {
    switch (rune) {
      case '$': {
        const offset = data.length - rune.length;
        if (hasIdentifierRuneBefore(data, offset)) return this;
        return new TagState(offset);
      }
      case "'":
        return new QuoteState(rune, endsWithKeyword(data.slice(0, -1), 'E'));
      case '"':
        return new QuoteState(rune, false);
      case '-':
        return new CommentState();
      case '/':
        return new BlockState();
      case '\\':
        return new EscapeState();
      case ';':
        return null;
      case '(':
        return new ParenState(this);
      case 'c':
      case 'C':
        if (isBeginAtomic(data)) {
          return new AtomicState(this, data.length);
        }
        return this;
      default:
        return this;
    }
  }
}

class CommentState implements State {
  next(rune: string): State {
    return isNewline(rune) ? new ReadyState() : this;
  }
}

class BlockState implements State {
  private depth = 0;
  next(rune: string, data: string): State | null {
    const window = data.slice(-2);
    if (window === '/*') {
      this.depth += 1;
      return this;
    }
    if (this.depth === 0) return new ReadyState().next(rune, data);
    if (window === '*/') {
      this.depth -= 1;
      if (this.depth === 0) return new ReadyState();
    }
    return this;
  }
}

class QuoteState implements State {
  private escape = false;
  private backslash = false;
  constructor(
    private readonly delimiter: string,
    private readonly backslashEscapes: boolean,
  ) {}
  next(rune: string, data: string): State | null {
    if (this.escape) {
      if (rune === this.delimiter) {
        this.escape = false;
        return this;
      }
      if (this.backslashEscapes) return new QuoteContinueState().next(rune, data);
      return new ReadyState().next(rune, data);
    }
    if (this.backslash) {
      this.backslash = false;
      return this;
    }
    if (this.backslashEscapes && rune === '\\') {
      this.backslash = true;
      return this;
    }
    if (rune === this.delimiter) this.escape = true;
    return this;
  }
}

// After an escape string's closing quote, whitespace holding a newline and then a quote
// continues the same literal (scan.l `quotecontinue`); `--` comments count as whitespace.
class QuoteContinueState implements State {
  private newline = false;
  private dashes = 0;
  next(rune: string, data: string): State | null {
    if (this.dashes === 2) {
      if (isNewline(rune)) {
        this.dashes = 0;
        this.newline = true;
      }
      return this;
    }
    if (rune === '-') {
      this.dashes += 1;
      return this;
    }
    if (this.dashes === 0) {
      if (isSqlWhitespace(rune)) {
        this.newline ||= isNewline(rune);
        return this;
      }
      if (this.newline && rune === "'") return new QuoteState(rune, true);
    }
    return new ReadyState().next(rune, data);
  }
}

class DollarState implements State {
  constructor(private readonly delimiter: string) {}
  next(_rune: string, data: string): State | null {
    if (data.slice(-this.delimiter.length) === this.delimiter) return new ReadyState();
    return this;
  }
}

class TagState implements State {
  constructor(private readonly offset: number) {}
  next(rune: string, data: string): State | null {
    if (rune === '$') return new DollarState(data.slice(this.offset));
    if (isIdentifierRune(rune)) return this;
    return new ReadyState().next(rune, data);
  }
}

class EscapeState implements State {
  next(): State | null {
    return new ReadyState();
  }
}

class ParenState implements State {
  constructor(private prev: State) {}
  next(rune: string, data: string): State | null {
    const curr = this.prev.next(rune, data);
    if (curr === null) {
      this.prev = new ReadyState();
      return this;
    }
    this.prev = curr;
    if (!(this.prev instanceof ReadyState)) return this;
    return rune === ')' ? new ReadyState() : this;
  }
}

class AtomicState implements State {
  private pendingEnd = false;
  private statementStart: number;
  private statementHasContent = false;
  constructor(
    private prev: State,
    statementStart: number,
  ) {
    this.statementStart = statementStart;
  }
  next(rune: string, data: string): State | null {
    const pendingEnd = this.pendingEnd;
    this.pendingEnd = false;
    if (pendingEnd && !isIdentifierRune(rune)) {
      return new ReadyState().next(rune, data);
    }
    const curr = this.prev.next(rune, data);
    if (curr === null) {
      this.prev = new ReadyState();
      this.statementStart = data.length;
      this.statementHasContent = false;
      return this;
    }
    this.prev = curr;
    if (!(this.prev instanceof ReadyState)) return this;
    if (!this.statementHasContent && endsWithKeyword(data, END_ATOMIC)) {
      if (isCommentsAndWhitespace(data.slice(this.statementStart, data.length - END_ATOMIC.length))) {
        this.pendingEnd = true;
      } else {
        this.statementHasContent = true;
      }
    }
    return this;
  }
}

/**
 * One raw token from {@link splitRaw}. `terminated` is `false` only for a trailing
 * statement emitted at EOF with no closing delimiter.
 */
interface RawToken {
  readonly text: string;
  readonly terminated: boolean;
}

/** The FSM traversal shared by every `splitSql*` entry point below. */
function splitRaw(sql: string): RawToken[] {
  let state: State = new ReadyState();
  const tokens: RawToken[] = [];
  let start = 0;
  let end = 0;
  for (const rune of sql) {
    end += rune.length;
    const data = sql.slice(start, end);
    const next = state.next(rune, data);
    if (next === null) {
      tokens.push({ text: data, terminated: true });
      start = end;
      state = new ReadyState();
    } else {
      state = next;
    }
  }
  if (end > start) tokens.push({ text: sql.slice(start), terminated: false });
  return tokens;
}

/** Splits `sql` into raw statements (comments/whitespace preserved), then applies transforms. */
export function splitSql(
  sql: string,
  ...transform: ReadonlyArray<(s: string) => string>
): string[] {
  const statements: string[] = [];
  for (const { text: raw } of splitRaw(sql)) {
    let token = raw;
    for (const apply of transform) token = apply(token);
    if (token.length > 0) statements.push(token);
  }
  return statements;
}

/** Per-token transform: trim trailing `;` then surrounding whitespace. */
const trimStatement = (token: string): string => token.replace(/;+$/u, '').trim();

/** Trims trailing `;` then surrounding whitespace from each statement. */
export function splitAndTrim(sql: string): string[] {
  return splitSql(sql, trimStatement);
}

/** One statement, paired with both its raw and trimmed forms. */
export interface SplitSqlToken {
  readonly raw: string;
  readonly trimmed: string;
  readonly terminated: boolean;
}

/**
 * Same FSM traversal as {@link splitAndTrim}, but keeps empty-after-trim statements too,
 * so callers that count raw tokens still see every one of them.
 */
export function splitSqlTokens(sql: string): ReadonlyArray<SplitSqlToken> {
  return splitRaw(sql).map(({ text: raw, terminated }) => ({
    raw,
    trimmed: trimStatement(raw),
    terminated,
  }));
}

// Case-insensitive: matches "drop" followed by whitespace.
const DROP_STATEMENT_PATTERN = /drop\s+/i;

/**
 * Extracts DROP statements from a schema diff for the safety warning shown by `db diff`,
 * `db pull`, and declarative `sync`.
 */
export function findDropStatements(sql: string): ReadonlyArray<string> {
  return splitAndTrim(sql).filter((statement) => DROP_STATEMENT_PATTERN.test(statement));
}



