import { Body } from '../model/body';
import { ProductID } from './ids';

/**
 * An array of primary colors for the blue team. The array index corresponds to the colors in-game ID.
 * Taken from https://www.reddit.com/r/RLFashionAdvice/comments/9l1swx/rocket_league_color_palette_with_hex_and_rgb/
 */
export const BLUE_PRIMARY_COLORS = [
  '#507F39',
  '#397F3F',
  '#397F64',
  '#397D7F',
  '#396B7F',
  '#395D7F',
  '#394F7F',
  '#39427F',
  '#4C397F',
  '#51397F',
  '#65B23E',
  '#3EB248',
  '#3EB286',
  '#3EAEB2',
  '#3E91B2',
  '#3E7AB2',
  '#3E63B2',
  '#3E4DB2',
  '#5D3EB2',
  '#673EB2',
  '#72E539',
  '#39E547',
  '#39E5A3',
  '#39DFE5',
  '#39B4E5',
  '#3992E5',
  '#396FE5',
  '#3950E5',
  '#6739E5',
  '#7539E5',
  '#5CFC0C',
  '#0CFC20',
  '#0CFCA0',
  '#0CF4FC',
  '#0CB8FC',
  '#0C88FC',
  '#0C58FC',
  '#0C2CFC',
  '#4C0CFC',
  '#600CFC',
  '#4ACC0A',
  '#0ACC1A',
  '#0ACC81',
  '#0AC5CC',
  '#0A95CC',
  '#0A6ECC',
  '#0A47CC',
  '#0A24CC',
  '#3D0ACC',
  '#4E0ACC',
  '#3CA508',
  '#08A515',
  '#08A569',
  '#08A0A5',
  '#0879A5',
  '#0859A5',
  '#083AA5',
  '#081DA5',
  '#3208A5',
  '#3F08A5',
  '#2E7F06',
  '#067F10',
  '#067F51',
  '#067B7F',
  '#065D7F',
  '#06447F',
  '#062C7F',
  '#06167F',
  '#26067F',
  '#30067F'
];

/**
 * An array of primary colors for the orange team. The array index corresponds to the colors in-game ID.
 * Taken from https://www.reddit.com/r/RLFashionAdvice/comments/9l1swx/rocket_league_color_palette_with_hex_and_rgb/
 */
export const ORANGE_PRIMARY_COLORS = [
  '#7F7F39',
  '#7F7039',
  '#7F6339',
  '#7F5A39',
  '#7F5439',
  '#7F4E39',
  '#7F4739',
  '#7F3939',
  '#7F3951',
  '#7F395C',
  '#B2B23E',
  '#B2993E',
  '#B2843E',
  '#B2743E',
  '#B26A3E',
  '#B2613E',
  '#B2553E',
  '#B23E3E',
  '#B23E67',
  '#B23E78',
  '#E5E539',
  '#E5C039',
  '#E5A039',
  '#E58939',
  '#E57B39',
  '#E56D39',
  '#E55B39',
  '#E53939',
  '#E53975',
  '#E5398F',
  '#FCFC0C',
  '#FCC80C',
  '#FC9C0C',
  '#FC7C0C',
  '#FC680C',
  '#FC540C',
  '#FC3C0C',
  '#FC0C0C',
  '#FC0C60',
  '#FC0C84',
  '#CCCC0A',
  '#CCA20A',
  '#CC7E0A',
  '#CC640A',
  '#CC540A',
  '#CC440A',
  '#CC300A',
  '#CC0A0A',
  '#CC0A4E',
  '#CC0A6B',
  '#A5A508',
  '#A58308',
  '#A56608',
  '#A55108',
  '#A54408',
  '#A53708',
  '#A52708',
  '#A50808',
  '#A5083F',
  '#A50857',
  '#7F7F06',
  '#7F6506',
  '#7F4F06',
  '#7F3E06',
  '#7F3406',
  '#7F2A06',
  '#7F1E06',
  '#7F0606',
  '#7F0630',
  '#7F0642'
];

/**
 * An array of accent colors. The array index corresponds to the colors in-game ID.
 * Taken from https://www.reddit.com/r/RLFashionAdvice/comments/9l1swx/rocket_league_color_palette_with_hex_and_rgb/
 */
export const ACCENT_COLORS = [
  '#E5E5E5',
  '#FF7F7F',
  '#FF9F7F',
  '#FFCF7F',
  '#EFFF7F',
  '#AFFF7F',
  '#7FFF7F',
  '#7FFFB2',
  '#7FE9FF',
  '#7FB0FF',
  '#7F88FF',
  '#AE7FFF',
  '#E57FFF',
  '#FF7FD0',
  '#FF7F94',
  '#BFBFBF',
  '#FF5959',
  '#FF8259',
  '#FFC059',
  '#EAFF59',
  '#97FF59',
  '#59FF59',
  '#59FF9B',
  '#59E3FF',
  '#5998FF',
  '#5964FF',
  '#9659FF',
  '#DD59FF',
  '#FF59C2',
  '#FF5974',
  '#999999',
  '#FF3232',
  '#FF6532',
  '#FFB232',
  '#E5FF32',
  '#7FFF32',
  '#32FF32',
  '#32FF84',
  '#32DCFF',
  '#3281FF',
  '#3240FF',
  '#7D32FF',
  '#D632FF',
  '#FF32B4',
  '#FF3255',
  '#666666',
  '#FF0000',
  '#FF3F00',
  '#FF9F00',
  '#DFFF00',
  '#5FFF00',
  '#00FF00',
  '#00FF66',
  '#00D4FF',
  '#0061FF',
  '#0011FF',
  '#5D00FF',
  '#CC00FF',
  '#FF00A1',
  '#FF002A',
  '#3F3F3F',
  '#B20000',
  '#B22C00',
  '#B26F00',
  '#9CB200',
  '#42B200',
  '#00B200',
  '#00B247',
  '#0094B2',
  '#0044B2',
  '#000BB2',
  '#4100B2',
  '#8E00B2',
  '#B20071',
  '#B2001D',
  '#262626',
  '#660000',
  '#661900',
  '#663F00',
  '#596600',
  '#266600',
  '#006600',
  '#006628',
  '#005466',
  '#002766',
  '#000666',
  '#250066',
  '#510066',
  '#660040',
  '#660011',
  '#000000',
  '#330000',
  '#330C00',
  '#331F00',
  '#2C3300',
  '#133300',
  '#003300',
  '#003314',
  '#002A33',
  '#001333',
  '#000333',
  '#120033',
  '#280033',
  '#330020',
  '#330008'
];

/**
 * The default blue primary color, that's set when creating a new loadout.
 */
export const DEFAULT_BLUE_TEAM = BLUE_PRIMARY_COLORS[35];
/**
 * The default orange primary color, that's set when creating a new loadout.
 */
export const DEFAULT_ORANGE_TEAM = ORANGE_PRIMARY_COLORS[33];
/**
 * The default accent color, that's set when creating a new loadout.
 */
export const DEFAULT_ACCENT = ACCENT_COLORS[0];

export const PAINT_NONE = 0; // is this actually used?
export const PAINT_CRIMSON = 1;
export const PAINT_LIME = 2;
export const PAINT_BLACK = 3;
export const PAINT_SKY_BLUE = 4;
export const PAINT_COBALT = 5;
export const PAINT_BURNT_SIENNA = 6;
export const PAINT_FOREST_GREEN = 7;
export const PAINT_PURPLE = 8;
export const PAINT_PINK = 9;
export const PAINT_ORANGE = 10;
export const PAINT_GREY = 11;
export const PAINT_TITANIUM_WHITE = 12;
export const PAINT_SAFFRON = 13;

export const PAINT_COLORS = Array<string>(14);
PAINT_COLORS[PAINT_BLACK] = '#000000';
PAINT_COLORS[PAINT_TITANIUM_WHITE] = '#ffffff';
PAINT_COLORS[PAINT_GREY] = '#8f8f8f';
PAINT_COLORS[PAINT_CRIMSON] = '#ff0000';
PAINT_COLORS[PAINT_ORANGE] = '#ff5d00';
PAINT_COLORS[PAINT_SAFFRON] = '#e3e300';
PAINT_COLORS[PAINT_LIME] = '#a9ff00';
PAINT_COLORS[PAINT_FOREST_GREEN] = '#00ba09';
PAINT_COLORS[PAINT_SKY_BLUE] = '#00b5e8';
PAINT_COLORS[PAINT_COBALT] = '#0048ed';
PAINT_COLORS[PAINT_PINK] = '#ff38f8';
PAINT_COLORS[PAINT_PURPLE] = '#8800cc';
PAINT_COLORS[PAINT_BURNT_SIENNA] = '#843d00';

export const COLOR_MAPLE_BLUE = '#0000F3';
export const COLOR_MAPLE_ORANGE = '#800000';

export const COLOR_BERRY_ORANGE = '#B3915F';
export const COLOR_BERRY_BLUE = '#656336';

export function getColorsForBody(body: Body): { [team: string]: string[] } {
  switch (body.id) {
    case ProductID.BODY_MAPLE:
    case ProductID.BODY_SLIME:
      return {blue: [COLOR_MAPLE_BLUE], orange: [COLOR_MAPLE_ORANGE]};
    case ProductID.BODY_BERRY:
      return {blue: [COLOR_BERRY_BLUE], orange: [COLOR_BERRY_ORANGE]};
    default:
      return {blue: BLUE_PRIMARY_COLORS, orange: ORANGE_PRIMARY_COLORS};
  }
}
