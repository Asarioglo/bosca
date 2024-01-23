const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === "development";

    return {
        mode: isDevelopment ? "development" : "production",
        devtool: isDevelopment ? "cheap-module-source-map" : false,
        entry: {
            "content-script": "./src/content-scripts/src/main.ts",
            "background-worker": "./src/background/entrypoint.ts",
        },
        output: {
            path: isDevelopment
                ? path.resolve(__dirname, "dist/dev")
                : path.resolve(__dirname, "dist/src"),
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        optimization: {
            minimize: !isDevelopment,
            minimizer: [
                new TerserPlugin({
                    extractComments: false, // remove comments from the output
                }),
            ],
        },
    };
};
