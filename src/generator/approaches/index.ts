import { TangibleStrategy } from './tangible';
import { StandardStrategy } from './standard';

export const strategies = {
    tangible: new TangibleStrategy(),
    standard: new StandardStrategy(),
};
