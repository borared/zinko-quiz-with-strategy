// @zinko/shared — constants/colors.js (ESM)
export const COLORS = {
  ZK_YELLOW: '#FFCD29',
  ZK_BLUE:   '#3B68FF',
  ZK_BLACK:  '#000000',
  ZK_WHITE:  '#FFFFFF',
  PURPLE:       '#5D3FD3',
  GREEN_EASY:   '#00C853',
  AMBER_MEDIUM: '#FFB300',
  RED_HARD:     '#D32F2F',
  ANSWER_A: '#5D3FD3',
  ANSWER_B: '#FF6B4A',
  ANSWER_C: '#FF4B4B',
  ANSWER_D: '#2D3436',
};

export const SHADOWS = {
  SM:  '2px 2px 0px 0px rgba(0,0,0,1)',
  MD:  '4px 4px 0px 0px rgba(0,0,0,1)',
  LG:  '6px 6px 0px 0px rgba(0,0,0,1)',
  XL:  '10px 10px 0px 0px rgba(0,0,0,1)',
  XXL: '12px 12px 0px 0px rgba(0,0,0,1)',
};

if (typeof module !== 'undefined') {
  module.exports = { COLORS, SHADOWS };
}
