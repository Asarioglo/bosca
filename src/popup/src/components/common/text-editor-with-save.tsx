import styled from "@emotion/styled";
import { Check, Clear, Help } from "@mui/icons-material";
import { CircularProgress, TextField } from "@mui/material";
import HelperTooltip from "./helper-tooltip";
import React from "react";
import { useEffect } from "react";

export type TextEditorParams = {
    text: string;
    isSaving: boolean;
    textTooltip?: string;
    saveTooltip?: string;
    cancelTooltip?: string;
    cantSaveTooltip?: string;
    minChars?: number;
    onTextSave: (text: string) => void;
    validate?: (text: string) => boolean | string;
    placeholder?: string;
    disabled?: boolean;
    defaultValue?: string;
};

const TextInput = styled(TextField)`
    text-align: center;
    justify-content: center;
    width: 100%;
`;

const SaveTextCheck = styled(Check)`
    :hover {
        cursor: pointer;
    }
    color: green;
`;

const SaveTextCheckDisabled = styled(Check)`
    :hover {
        cursor: pointer;
    }
    color: grey;
`;

const CancelSaveX = styled(Clear)`
    :hover {
        cursor: pointer;
    }
    color: red;
`;

const ProgressIndicator = () => (
    <CircularProgress
        size={20}
        sx={{
            color: "#000",
            padding: "0 0.5rem",
        }}
    />
);

const TextEditorContainer = styled.div`
    display: flex;
    width: 100%;
`;

const ActionsContainer = styled.div`
    display: flex;
    margin-left: -50px;
`;

const InputContainer = styled.div`
    width: 100%;
`;

const TextEdirorWithSave = ({
    text,
    isSaving,
    minChars,
    onTextSave,
    textTooltip,
    saveTooltip,
    cancelTooltip,
    cantSaveTooltip,
    validate,
    placeholder,
    disabled,
    defaultValue,
}: TextEditorParams) => {
    const [hasTextChanges, setHasTextChanges] = React.useState(false);
    const [textInternal, setTextInternal] = React.useState(text);
    const [canSave, setCanSave] = React.useState(false);
    const [minCharsInternal, setMinCharsInternal] = React.useState(
        minChars || 1000,
    );

    useEffect(() => {
        if (minChars) {
            setMinCharsInternal(minChars);
        }
    }, [minChars]);

    useEffect(() => {
        setTextInternal(text);
        setHasTextChanges(false);
    }, [text]);

    const handleTextChange = (event: any) => {
        let newText = event.target.value;

        if (validate) {
            const res = validate(newText);
            if (res === true) {
                setCanSave(true);
            } else if (res === false) {
                setCanSave(false);
            } else {
                newText = res;
                setCanSave(true);
            }
        } else {
            setCanSave(true);
        }

        setTextInternal(newText);
        if (newText !== text) {
            setHasTextChanges(true);
        } else {
            setHasTextChanges(false);
        }
    };

    const handleSaveText = () => {
        onTextSave(textInternal);
    };

    const handleCancelText = () => {
        setTextInternal(text);
        setHasTextChanges(false);
    };

    if (isSaving) return <ProgressIndicator />;
    return (
        <TextEditorContainer className="text-editor-container">
            {hasTextChanges && (
                <ActionsContainer className="actions-container">
                    <HelperTooltip
                        title={cancelTooltip || "Cancel & reset changes"}
                    >
                        <CancelSaveX onClick={handleCancelText} />
                    </HelperTooltip>
                    {canSave ? (
                        <HelperTooltip title={saveTooltip || "Save changes"}>
                            <SaveTextCheck onClick={handleSaveText} />
                        </HelperTooltip>
                    ) : (
                        <HelperTooltip
                            title={cantSaveTooltip || "Can't save tooltip"}
                        >
                            <SaveTextCheckDisabled />
                        </HelperTooltip>
                    )}
                </ActionsContainer>
            )}
            <InputContainer className="text-input-container">
                <HelperTooltip title={textTooltip || null}>
                    <TextInput
                        size="small"
                        variant="standard"
                        sx={{
                            input: {
                                textAlign: "center",
                            },
                        }}
                        value={textInternal}
                        onChange={handleTextChange}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                </HelperTooltip>
            </InputContainer>
        </TextEditorContainer>
    );
};

export default TextEdirorWithSave;
