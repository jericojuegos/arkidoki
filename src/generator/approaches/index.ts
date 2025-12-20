import { TangibleStrategy } from './tangible/index';
import { StandardStrategy } from './standard/index';

export const strategies = {
    tangible: new TangibleStrategy(),
    standard: new StandardStrategy(),
};
