export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const getStatusColorText = (status: string) => {
  switch (status) {
    case 'PAGO': return 'text-[#34C759]'; // iOS Green
    case 'PENDENTES': return 'text-[#FF9500]'; // iOS Orange
    case 'AGUARDANDO INICIO': return 'text-[#007AFF]'; // iOS Blue
    default: return 'text-gray-800';
  }
};

export const getStatusColorBg = (status: string) => {
  switch (status) {
    case 'PAGO': return 'bg-[#34C759]';
    case 'PENDENTES': return 'bg-[#FF9500]';
    case 'AGUARDANDO INICIO': return 'bg-[#007AFF]';
    default: return 'bg-gray-800';
  }
};

function crc16(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    for (let bit = 0; bit < 8; bit++) {
      const bitOn = ((charCode >> (7 - bit)) & 1) === 1;
      const crcOn = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (bitOn !== crcOn) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xFFFF;
  let hex = crc.toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = '0' + hex;
  }
  return hex;
}

export function generatePixPayload(key: string, amount: number, merchantName: string = 'FINAX', merchantCity: string = 'SAO PAULO', txId: string = '***'): string {
  const cleanKey = key.trim();
  
  const f = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return id + len + value;
  };

  const gui = f('00', 'br.gov.pix');
  const keyField = f('01', cleanKey);
  const merchantAccountInfo = f('26', gui + keyField);

  let payload = '000201';
  payload += merchantAccountInfo;
  payload += f('52', '0000');
  payload += f('53', '986');
  
  if (amount > 0) {
    payload += f('54', amount.toFixed(2));
  }
  
  payload += f('58', 'BR');
  
  const cleanName = merchantName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().substring(0, 25) || 'FINAX';
  const cleanCity = merchantCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().substring(0, 15) || 'SAO PAULO';
  
  payload += f('59', cleanName);
  payload += f('60', cleanCity);
  
  const cleanTxId = txId.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 25) || '***';
  const txIdField = f('05', cleanTxId);
  payload += f('62', txIdField);
  
  payload += '6304';
  
  const checksum = crc16(payload);
  return payload + checksum;
}

