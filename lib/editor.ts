export function highlight(code: string, lang: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = escaped.split('\n')
  const styled = lines.map((line, i) => {
    let html = line
    if (lang === 'typescript' || lang === 'tsx') {
      html = html
        .replace(/\b(export|function|interface|type|const|let|return|if|else|import|from|as)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/\/\/.*/g, '<span class="tok-com">$&</span>')
        .replace(/"([^"]*)"/g, '<span class="tok-str">"$1"</span>')
        .replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>')
    }
    return `<div class="code-line" id="L${i + 1}"><span class="line-num">${i + 1}</span><span class="code">${html}</span></div>`
  })
  return styled.join('')
}