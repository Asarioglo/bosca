import { Typography } from "@mui/material";
import PageContainer from "../components/common/page-container";
import PageHeading from "../components/common/page-heading";
import PageSubheading from "../components/common/page-subheading";
import styled from "@emotion/styled";
import SectionHeading from "../components/common/page-section-heading";
import ContactUs from "../components/help-page/contact-us";
import { useEffect, useState } from "react";
import { useOverlay } from "../overlay/overlay-provider";
import { useAnalytics } from "../metrics/analytics-provider";

type FAQ = {
    id: string;
    title: string;
    url: string;
    order: number;
};

const FAQContainer = styled.div`
    margin-top: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
`;

const FAQRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    font-weight: bold;
    padding: 0.5em 0.5em;
    margin: 2px 0;
    cursor: pointer;

    &:hover {
        background-color: #eee;
    }
`;

const HelpPage = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const { showWebpage } = useOverlay();
    const { sendMetric } = useAnalytics();

    useEffect(() => {
        if (chrome.runtime) {
            chrome.runtime.sendMessage(
                { type: "help:list-faqs" },
                (responseData: any) => {
                    const faqs = responseData.help?.faqs || [];
                    setFaqs(faqs);
                },
            );
        }
    }, []);

    useEffect(() => {
        sendMetric("help page opened");

        return () => {
            sendMetric("help page closed");
        };
    }, [sendMetric]);

    const logFaqClicked = (faq: string) => {
        sendMetric(`FAQ clicked: ${faq} `);
    };

    return (
        <PageContainer>
            <PageHeading>
                <Typography variant="h6">Help</Typography>
            </PageHeading>
            <PageSubheading>
                If you have questions, suggestions, or need help, please use the
                methods below to contact us. We will do our best to respond as
                soon as possible.
            </PageSubheading>
            <ContactUs />
            <SectionHeading>FAQ</SectionHeading>
            <FAQContainer>
                {faqs?.map((faq) => (
                    <FAQRow
                        key={faq.id}
                        onClick={() => {
                            showWebpage(faq.url);
                            logFaqClicked(faq.title);
                        }}
                    >
                        {faq.title}
                    </FAQRow>
                ))}
            </FAQContainer>
        </PageContainer>
    );
};

export default HelpPage;
