export function formatDocument(documento: string): string {
  if (!documento) return '';
  const cleaned = documento.replace(/\D/g, '');
  if (cleaned.length === 11) {
    // CPF: 999.999.999-99
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  } else if (cleaned.length === 14) {
    // CNPJ: 99.999.999/9999-99
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  return documento; // Retorna o que veio se não for CPF nem CNPJ
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    // (99) 99999-9999
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    // (99) 9999-9999
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

export const normalize = (value: string | number): string => {
  const str = String(value);

  // Se for um número (apenas dígitos), remove tudo que não for número
  if (/^\d+$/.test(str.replace(/\D/g, ''))) {
    return str.replace(/\D/g, '');
  }

  // Se for texto, remove acentos, pontuação e espaços, e deixa minúsculo
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f.,-/\s]/g, "")
    .toLowerCase();
};

// Função para formatar valor monetário
export const formatMoney = (value: string | number) => {
  if (!value) return 'R$ 0,00'; // início vazio

  // Se for string, limpa tudo que não for dígito
  let cleanValue = typeof value === 'string'
    ? value.replace(/\D/g, '') // remove tudo que não for número
    : value.toString();

  // Se ainda assim estiver vazio ou inválido
  if (!cleanValue || isNaN(Number(cleanValue))) return '';

  // Converte para número e divide por 100 para centavos
  const numericValue = Number(cleanValue) / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(numericValue);
};