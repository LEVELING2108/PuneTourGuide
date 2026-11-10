// Generated from design-reference/classic/ContactAdd.dc.html by scripts/convert-designs.py, then wired up by hand.
import type { ViewProps } from '../types';

const css = `

`;

export default function ContactAddView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-ContactAdd" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-ContactAdd" precedence="screens">{css}</style>
      {v.underlay /* dc-import ContactEdit mode="add" */}
    </div>
  );
}
