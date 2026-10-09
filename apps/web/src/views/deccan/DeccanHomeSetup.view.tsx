// Generated from design-reference/deccan/DeccanHomeSetup.dc.html by scripts/convert-designs.py, then wired up by hand.
import type { ViewProps } from '../types';

const css = `

`;

export default function DeccanHomeSetupView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanHomeSetup" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanHomeSetup" precedence="screens">{css}</style>
      {v.underlay /* dc-import DeccanHome safety-ready="{{ false }}" */}
    </div>
  );
}
