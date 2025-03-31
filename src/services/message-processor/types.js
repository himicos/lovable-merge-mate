export var MessageSource;
(function (MessageSource) {
    MessageSource["EMAIL"] = "email";
    MessageSource["GMAIL"] = "gmail";
    MessageSource["SLACK"] = "slack";
    MessageSource["TEAMS"] = "teams";
})(MessageSource || (MessageSource = {}));
export var MessageCategory;
(function (MessageCategory) {
    MessageCategory["IMPORTANT"] = "important";
    MessageCategory["INDIRECT"] = "indirect";
    MessageCategory["MARKETING"] = "marketing";
    MessageCategory["SYSTEM"] = "system";
    MessageCategory["UNKNOWN"] = "unknown";
})(MessageCategory || (MessageCategory = {}));
export var MessageAction;
(function (MessageAction) {
    MessageAction["GENERATE_PROMPT"] = "generate_prompt";
    MessageAction["CREATE_SUMMARY"] = "create_summary";
    MessageAction["MARK_READ"] = "mark_read";
    MessageAction["MOVE"] = "move";
})(MessageAction || (MessageAction = {}));
