import type { FeatureDocumentation } from '../../types/documentation';
import { paginationDocs } from './pagination';
import { tableOptionsDocs } from './tableOptions';
import { loadingStatesDocs } from './loadingStates';

export const FEATURE_DOCS: Record<string, FeatureDocumentation> = {
    pagination: paginationDocs,
    'table-options': tableOptionsDocs,
    'loading-states': loadingStatesDocs,
};

export const getFeatureDocs = (featureId: string): FeatureDocumentation | undefined => {
    return FEATURE_DOCS[featureId];
};
