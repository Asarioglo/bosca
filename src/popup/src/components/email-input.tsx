import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { Box } from "@mui/system";
import TextField from "@mui/material/TextField";
import styled from "@emotion/styled";

import "react-quill/dist/quill.snow.css"; // import styles

export interface EmailEditorOutput {
    body?: string;
    subject?: string;
}

interface EmailEditorProps {
    onChange?: (changeObj: EmailEditorOutput) => void;
    html?: string;
    subject?: string;
}

const SubjectEdirorContainer = styled(Box)`
    padding: 0.5em 1em;
`;

const SubjectEditor = styled(TextField)`
    background-color: #fff;
    margin: 0;
`;

const EditorContainer = styled(Box)`
    background-color: #fff;
`;

const EmailEditor: React.FC<EmailEditorProps> = ({
    onChange,
    html,
    subject,
}) => {
    const [internalHtml, setInternalHtml] = useState(html || "");
    const [internalSubject, setInternalSubject] = useState(subject || "");

    useEffect(() => {
        setInternalHtml(html || "");
    }, [html]);

    useEffect(() => {
        setInternalSubject(subject || "");
    }, [subject]);

    const handleEmailChange = (
        value: string,
        delta: any,
        source: any,
        editor: any,
    ) => {
        if (source !== "user") {
            return;
        }
        setInternalHtml(value);
        if (onChange) {
            onChange({ body: value });
        }
    };

    const handleSubjectChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setInternalSubject(event.target.value);
        if (onChange) {
            onChange({ subject: event.target.value });
        }
    };

    return (
        <EditorContainer
            display="flex"
            flexDirection="column"
            width="100%"
            flexGrow={1}
            textAlign={"left"}
            position="relative"
            className="email-editor-container"
        >
            <SubjectEdirorContainer>
                <SubjectEditor
                    label="Subject"
                    value={internalSubject}
                    onChange={handleSubjectChange}
                    fullWidth
                    variant="standard"
                    size="small"
                />
            </SubjectEdirorContainer>
            <ReactQuill value={internalHtml} onChange={handleEmailChange} />
        </EditorContainer>
    );
};

export default EmailEditor;
