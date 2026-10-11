const KEY = 'pe_onboarded';

export const isOnboarded = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const markOnboarded = () => {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* storage unavailable: intro shows again next launch */
  }
};
