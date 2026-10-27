import { Link } from 'wouter';
import { BrandMark } from '../components/BrandMark';

export function Landing() {
  return (
    <main className="site-shell frontdoor-shell" style={{
      minHeight: '100vh',
      overflow: 'hidden',
      color: 'var(--text)',
      background: 'radial-gradient(ellipse at 80% 18%, color-mix(in srgb, var(--terrain-pale) 72%, transparent), transparent 34rem), var(--bg)',
      position: 'relative',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--hairline) 1px, transparent 1px),
          linear-gradient(90deg, var(--hairline) 1px, transparent 1px)
        `,
        backgroundSize: '34px 34px',
        content: '""',
        maskImage: 'linear-gradient(to bottom, #000 0%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header className="site-header" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        minHeight: '68px',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: '0 clamp(20px, 5vw, 76px)',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
        backdropFilter: 'blur(14px)',
      }}>
        <BrandMark size="md" />
        <div className="header-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <Link 
            href="/sign-in?next=%2Fworkspace%2Fpeople" 
            className="header-issue"
            style={{
              display: 'inline-flex',
              minHeight: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              padding: '0 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--bg-elev)',
              color: 'var(--text)',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: 'var(--step--1)',
            }}
          >
            Enter the studio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="frontdoor-hero" style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        width: 'min(1440px, 100%)',
        minHeight: 'min(760px, calc(100svh - 68px))',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, .95fr)',
        alignItems: 'center',
        gap: 'clamp(20px, 5vw, 88px)',
        margin: '0 auto',
        padding: 'clamp(64px, 9vw, 132px) clamp(24px, 7vw, 104px)',
      }}>
        {/* Copy */}
        <div className="frontdoor-copy" style={{ maxWidth: '650px' }}>
          <p className="eyebrow frontdoor-kicker" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-muted)',
            font: '10px/1.5 var(--mono)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}>
            <span className="signal-dot" style={{
              width: '7px',
              height: '7px',
              flex: 'none',
              borderRadius: '50%',
              background: 'var(--terrain)',
              boxShadow: '0 0 0 4px var(--terrain-pale)',
            }} />
            APT-LABS / SOVEREIGN COORDINATION ENGINE
          </p>
          
          <h1 style={{
            margin: '30px 0 22px',
            font: '400 clamp(46px, 6.2vw, 86px)/.99 var(--serif)',
            letterSpacing: '-.055em',
          }}>
            Make good work<br />
            <em style={{ color: 'var(--terrain)', fontWeight: '400' }}>find its people.</em>
          </h1>
          
          <p className="frontdoor-lede" style={{
            maxWidth: '480px',
            margin: 0,
            color: 'var(--text)',
            font: '400 clamp(18px, 2vw, 24px)/1.45 var(--serif)',
          }}>
            A practical network for people who build what their communities need.
          </p>
          
          <p className="frontdoor-body" style={{
            maxWidth: '470px',
            margin: '18px 0 30px',
            color: 'var(--text-muted)',
            lineHeight: '1.8',
          }}>
            APT-LABS brings local knowledge, capable hands, and committed capital into the same place—so ideas can move from intention to work in the world.
          </p>
          
          <div className="frontdoor-actions">
            <Link 
              className="button button-primary"
              href="/sign-in?next=%2Fworkspace%2Fpeople"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                minHeight: '40px',
                padding: '0 16px',
                border: '1px solid var(--terrain)',
                borderRadius: 'var(--radius-2)',
                background: 'var(--terrain)',
                color: 'var(--terrain-ink)',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background var(--fast), transform var(--fast)',
              }}
            >
              Enter the studio
            </Link>
          </div>
          
          <div className="frontdoor-coordinate" style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: '46px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border)',
            fontSize: '9px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--mono)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}>
            <span>BUILT FOR REAL-WORLD EXECUTION</span>
            <span>PROTOTYPE · 001</span>
          </div>
        </div>

        {/* Orbit Graphic */}
        <div className="frontdoor-orbit" style={{
          position: 'relative',
          display: 'grid',
          minHeight: '500px',
          placeItems: 'center',
          isolation: 'isolate',
        }} aria-label="APT-LABS: people, capability and capital working together">
          <div style={{
            position: 'absolute',
            zIndex: -1,
            width: 'min(90%, 460px)',
            aspectRatio: '1',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--bg-elev) 0 31%, color-mix(in srgb, var(--terrain-pale) 45%, transparent) 32% 60%, transparent 61%)',
            content: '""',
          }} />
          
          <div className="frontdoor-orbit-coordinate" style={{
            position: 'absolute',
            top: '5%',
            right: 0,
            color: 'var(--text-muted)',
            font: '10px/1.5 var(--mono)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}>
            FIELD STATION / 00° 00′
          </div>

          <div className="frontdoor-orbit-graphic" style={{
            position: 'relative',
            width: 'min(72vw, 340px)',
            aspectRatio: '1',
            borderRadius: '50%',
          }} aria-hidden="true">
            {/* Outer ring - dashed */}
            <div className="frontdoor-orbit-ring frontdoor-orbit-ring-outer" style={{
              position: 'absolute',
              inset: 0,
              border: '1px dashed var(--border-strong)',
              borderRadius: '50%',
              opacity: '0.65',
            }} />
            
            {/* Inner ring */}
            <div className="frontdoor-orbit-ring frontdoor-orbit-ring-inner" style={{
              position: 'absolute',
              inset: '24%',
              border: '1px solid color-mix(in srgb, var(--terrain) 44%, var(--border))',
              borderRadius: '50%',
            }} />
            
            {/* Cross hairs */}
            <div className="frontdoor-orbit-cross frontdoor-orbit-cross-x" style={{
              position: 'absolute',
              top: '50%',
              left: '4%',
              width: '92%',
              height: '1px',
              background: 'var(--border)',
            }} />
            <div className="frontdoor-orbit-cross frontdoor-orbit-cross-y" style={{
              position: 'absolute',
              top: '4%',
              left: '50%',
              width: '1px',
              height: '92%',
              background: 'var(--border)',
            }} />
            
            {/* Core */}
            <div className="frontdoor-orbit-core" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              display: 'flex',
              width: '104px',
              height: '104px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transform: 'translate(-50%, -50%)',
              border: '1px solid var(--border-strong)',
              borderRadius: '50%',
              background: 'var(--bg-elev)',
              boxShadow: 'var(--shadow-3)',
              color: 'var(--terrain)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <b style={{ color: 'var(--text)', font: '10px var(--mono)', letterSpacing: '.16em' }}>APT</b>
            </div>

            {/* Orbit points */}
            <div className="frontdoor-orbit-point frontdoor-orbit-point-one" style={{
              position: 'absolute',
              zIndex: 1,
              top: '13%',
              left: '27%',
              width: '12px',
              height: '12px',
              border: '3px solid var(--bg)',
              borderRadius: '50%',
              background: 'var(--terrain)',
              boxShadow: '0 0 0 1px var(--terrain)',
            }} />
            <div className="frontdoor-orbit-point frontdoor-orbit-point-two" style={{
              position: 'absolute',
              zIndex: 1,
              top: '48%',
              right: '2%',
              width: '12px',
              height: '12px',
              border: '3px solid var(--bg)',
              borderRadius: '50%',
              background: 'var(--brass)',
              boxShadow: '0 0 0 1px var(--brass)',
            }} />
            <div className="frontdoor-orbit-point frontdoor-orbit-point-three" style={{
              position: 'absolute',
              zIndex: 1,
              bottom: '13%',
              left: '27%',
              width: '12px',
              height: '12px',
              border: '3px solid var(--bg)',
              borderRadius: '50%',
              background: 'var(--water)',
              boxShadow: '0 0 0 1px var(--water)',
            }} />

            {/* Labels */}
            <div className="frontdoor-orbit-label frontdoor-orbit-label-one" style={{
              position: 'absolute',
              top: '19%',
              left: 0,
              display: 'grid',
              gap: '4px',
              color: 'var(--text-muted)',
              font: '10px/1.5 var(--mono)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>
              <span>01 / PEOPLE</span>
              <strong style={{ font: '500 14px var(--serif)', color: 'var(--terrain)' }}>Skill in motion</strong>
            </div>
            <div className="frontdoor-orbit-label frontdoor-orbit-label-two" style={{
              position: 'absolute',
              top: '47%',
              right: '-2%',
              display: 'grid',
              gap: '4px',
              textAlign: 'right',
              color: 'var(--text-muted)',
              font: '10px/1.5 var(--mono)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>
              <span>02 / CAPITAL</span>
              <strong style={{ font: '500 14px var(--serif)', color: 'var(--brass)' }}>Purposeful backing</strong>
            </div>
            <div className="frontdoor-orbit-label frontdoor-orbit-label-three" style={{
              position: 'absolute',
              bottom: '12%',
              left: '2%',
              display: 'grid',
              gap: '4px',
              color: 'var(--text-muted)',
              font: '10px/1.5 var(--mono)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>
              <span>03 / EVIDENCE</span>
              <strong style={{ font: '500 14px var(--serif)', color: 'var(--water)' }}>Work that stands</strong>
            </div>

            {/* Stamp */}
            <div className="frontdoor-orbit-stamp" style={{
              position: 'absolute',
              top: '4%',
              left: 0,
              padding: '10px 12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elev)',
              lineHeight: '1.6',
              color: 'var(--text-muted)',
              font: '10px/1.5 var(--mono)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>
              A NETWORK<br />BUILT TO DO
            </div>

            {/* Caption */}
            <div className="frontdoor-orbit-caption" style={{
              position: 'absolute',
              right: 0,
              bottom: '4%',
              color: 'var(--text-muted)',
              font: '10px/1.5 var(--mono)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}>
              COORDINATION IS INFRASTRUCTURE
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
