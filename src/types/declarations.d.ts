declare module 'xlsx' {
  const XLSX: any;
  export = XLSX;
}

declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}

declare module 'jspdf-autotable' {
  const autoTable: any;
  export default autoTable;
}

declare module 'socket.io-client' {
  export const io: (url?: string, options?: any) => any;
}
