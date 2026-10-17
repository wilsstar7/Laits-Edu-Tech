export const PDF_COLORS = {
  primary: [24, 48, 88] as [number, number, number],          // #183058
  primaryLight: [232, 236, 246] as [number, number, number],  // #E8ECF6
  dark: [15, 29, 51] as [number, number, number],             // #0F1D33
  body: [29, 29, 36] as [number, number, number],             // #1D1D24
  muted: [103, 106, 120] as [number, number, number],         // #676A78
  surface: [244, 246, 250] as [number, number, number],       // #F4F6FA
  border: [234, 235, 240] as [number, number, number],       // #EAEBF0
  white: [255, 255, 255] as [number, number, number],
  emerald: [69, 185, 124] as [number, number, number],       // #45B97C
  emeraldBg: [232, 248, 240] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],           // #D97706
  amberBg: [253, 244, 226] as [number, number, number],
  danger: [233, 106, 106] as [number, number, number],       // #E96A6A
  dangerBg: [253, 236, 236] as [number, number, number],
}

export const PDF_LAYOUT = {
  pageWidth: 595.28,   // A4 width in pt
  pageHeight: 841.89,  // A4 height in pt
  marginLeft: 44,
  marginRight: 44,
  marginTop: 44,
  marginBottom: 44,
  contentWidth: 595.28 - 88, // 507.28
}
