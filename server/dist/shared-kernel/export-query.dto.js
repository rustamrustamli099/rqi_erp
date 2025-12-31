"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportQueryDto = exports.ExportMode = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ExportMode;
(function (ExportMode) {
    ExportMode["CURRENT"] = "CURRENT";
    ExportMode["ALL"] = "ALL";
})(ExportMode || (exports.ExportMode = ExportMode = {}));
class ExportQueryDto {
    exportMode = ExportMode.CURRENT;
    search;
    sortBy;
    sortDir;
    filters;
    page = 1;
    pageSize = 15;
}
exports.ExportQueryDto = ExportQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExportMode),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "exportMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "sortDir", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return {};
            }
        }
        return value || {};
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExportQueryDto.prototype, "filters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10) || 1),
    __metadata("design:type", Number)
], ExportQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10) || 15),
    __metadata("design:type", Number)
], ExportQueryDto.prototype, "pageSize", void 0);
//# sourceMappingURL=export-query.dto.js.map