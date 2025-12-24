export var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "owner";
    UserRole["EDITOR"] = "editor";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
export var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PRIVATE"] = "private";
    ProjectVisibility["WORKSPACE"] = "workspace";
    ProjectVisibility["PUBLIC"] = "public";
})(ProjectVisibility || (ProjectVisibility = {}));
export var VideoStatus;
(function (VideoStatus) {
    VideoStatus["UPLOADING"] = "uploading";
    VideoStatus["PROCESSING"] = "processing";
    VideoStatus["READY"] = "ready";
    VideoStatus["ERROR"] = "error";
})(VideoStatus || (VideoStatus = {}));
export var ProcessingStage;
(function (ProcessingStage) {
    ProcessingStage["UPLOAD"] = "upload";
    ProcessingStage["EXTRACT_AUDIO"] = "extract_audio";
    ProcessingStage["TRANSCRIBE"] = "transcribe";
    ProcessingStage["ENHANCE_SCRIPT"] = "enhance_script";
    ProcessingStage["GENERATE_VOICEOVER"] = "generate_voiceover";
    ProcessingStage["DETECT_SCENES"] = "detect_scenes";
    ProcessingStage["GENERATE_CAPTIONS"] = "generate_captions";
    ProcessingStage["RENDER_VIDEO"] = "render_video";
    ProcessingStage["COMPLETE"] = "complete";
})(ProcessingStage || (ProcessingStage = {}));
export var DocumentFormat;
(function (DocumentFormat) {
    DocumentFormat["HTML"] = "html";
    DocumentFormat["MARKDOWN"] = "markdown";
    DocumentFormat["PDF"] = "pdf";
})(DocumentFormat || (DocumentFormat = {}));
export var ExportFormat;
(function (ExportFormat) {
    ExportFormat["MP4"] = "mp4";
    ExportFormat["WEBM"] = "webm";
    ExportFormat["HTML"] = "html";
    ExportFormat["MARKDOWN"] = "markdown";
    ExportFormat["PDF"] = "pdf";
})(ExportFormat || (ExportFormat = {}));
// Error Types
export class AppError extends Error {
    constructor(options) {
        super(options.message);
        this.code = options.code;
        this.details = options.details;
        this.name = 'AppError';
    }
}
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["PROCESSING_ERROR"] = "PROCESSING_ERROR";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=index.js.map