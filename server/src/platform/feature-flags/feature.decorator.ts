
import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature_flag';
export const Feature = (flag: string) => SetMetadata(FEATURE_KEY, flag);
