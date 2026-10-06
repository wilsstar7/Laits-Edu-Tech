export const PDF_COLORS = {
  primary: [108, 92, 231] as [number, number, number],       // #6C5CE7
  primaryLight: [239, 237, 253] as [number, number, number],  // #EFEDFD
  dark: [23, 24, 28] as [number, number, number],            // #17181C
  body: [29, 29, 36] as [number, number, number],            // #1D1D24
  muted: [103, 106, 120] as [number, number, number],        // #676A78
  surface: [244, 245, 251] as [number, number, number],      // #F4F5FB
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
