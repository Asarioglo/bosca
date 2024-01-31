export type Message = {
    type: string;
    payload?: {
        [key: string]: any;
    };
};
