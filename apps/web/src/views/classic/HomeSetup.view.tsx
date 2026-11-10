// Generated from design-reference/classic/HomeSetup.dc.html by scripts/convert-designs.py, then wired up by hand.
import type { ViewProps } from '../types';

const css = `

`;

export default function HomeSetupView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-HomeSetup" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-HomeSetup" precedence="screens">{css}</style>
      {v.underlay /* dc-import Main safety-ready="{{ false }}" */}
    </div>
  );
}
