/**
 * Converte uma data do formato YYYY-MM-DD para o formato ISO 8601 (YYYY-MM-DDThh:mm:ssZ)
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string|null} Data no formato ISO 8601 ou null se a entrada for inválida
 */
export const formatToISO = (dateString) => {
  if (!dateString) return null;
  // Cria um objeto Date com a data fornecida e define o horário para meio-dia UTC
  // para evitar problemas com timezone
  const date = new Date(dateString + 'T12:00:00Z');
  return date.toISOString();
};

/**
 * Converte uma data do formato ISO 8601 para o formato YYYY-MM-DD
 * @param {string} isoString - Data no formato ISO 8601
 * @returns {string} Data no formato YYYY-MM-DD ou string vazia se a entrada for inválida
 */
export const formatFromISO = (isoString) => {
  if (!isoString) return '';
  // Converte a data ISO para o formato YYYY-MM-DD
  return isoString.split('T')[0];
};

/**
 * Aplica a formatação ISO 8601 a todos os campos de data especificados em um objeto
 * @param {Object} data - Objeto contendo os dados
 * @param {string[]} dateFields - Array com os nomes dos campos que contêm datas
 * @returns {Object} Novo objeto com as datas formatadas
 */
export const formatDatesToISO = (data, dateFields) => {
  const formattedData = { ...data };
  dateFields.forEach(field => {
    if (data[field]) {
      formattedData[field] = formatToISO(data[field]);
    }
  });
  return formattedData;
};

/**
 * Aplica a formatação YYYY-MM-DD a todos os campos de data especificados em um objeto
 * @param {Object} data - Objeto contendo os dados
 * @param {string[]} dateFields - Array com os nomes dos campos que contêm datas
 * @returns {Object} Novo objeto com as datas formatadas
 */
export const formatDatesFromISO = (data, dateFields) => {
  const formattedData = { ...data };
  dateFields.forEach(field => {
    if (data[field]) {
      formattedData[field] = formatFromISO(data[field]);
    }
  });
  return formattedData;
};

/**
 * Formata uma data para o formato brasileiro dd/MM/yyyy
 * @param {string} dateString - Data em qualquer formato
 * @returns {string} Data formatada como dd/MM/yyyy ou '-' se inválida
 */
export const formatDateBR = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Se já está no formato ISO (YYYY-MM-DD), converte diretamente
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Tenta criar objeto Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '-';
  }
};