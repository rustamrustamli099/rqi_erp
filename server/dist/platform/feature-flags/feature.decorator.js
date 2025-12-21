"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = exports.FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURE_KEY = 'feature_flag';
const Feature = (flag) => (0, common_1.SetMetadata)(exports.FEATURE_KEY, flag);
exports.Feature = Feature;
//# sourceMappingURL=feature.decorator.js.map