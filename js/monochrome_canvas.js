
class MonochromeCanvas {
    #canvas = null;
    #context = null;
    #isProcessing = false;

    get pixels() {
        return this.#context.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
    }

    constructor(canvas) {
        this.#canvas = canvas;
        this.#context = canvas.getContext("2d", { willReadFrequently: true });
    }

    text(text, _fontFamily = "default", fontSize = 60, isBold = true, isTate = true) {
        const fontWeight = isBold ? 700 : 400;
        let tateMargin = 4;
        let fontFamily = "";
        switch (_fontFamily) {
            case "default":
                fontFamily = "'ＭＳ Ｐゴシック', '游ゴシック', YuGothic, 'メイリオ', Meiryo, 'ヒラギノ角ゴ ProN W3', 'Hiragino Kaku Gothic ProN', Verdana, Roboto, 'Droid Sans', sans-serif";
                break;
            case "sans":
                fontFamily = "'Noto Sans JP', sans-serif";
                break;
            case "serif":
                fontFamily = "'Noto Serif JP', serif";
                if (isTate) {
                    tateMargin = 8;
                }
                break;
            default: throw new Error(`引数が不正：${_fontFamily}`);
        }
        const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        if (isTate || text.length === 1) {
            this.#tateText(text, font, tateMargin);
        }
        else {
            this.#yokoText(text, font, tateMargin);
        }
    }

    #tateText(text, font, tateMargin = 4) {
        // const tmpCanvas = document.createElement("canvas");
        const tmpCanvas = document.querySelector("#canvas");
        const tmpContext = tmpCanvas.getContext("2d", { willReadFrequently: true });
        
        let minCanvasHeight = 0;
        const {
            width: standardCharWidth,
            height: standardCharHeight
        } = (() => {
            tmpContext.font = font;
            tmpContext.textBaseline = "top";
            tmpContext.textAlign = "center";
            const measure = tmpContext.measureText("あ")
            tmpCanvas.width = Math.ceil(measure.width);
            minCanvasHeight = Math.ceil(Math.abs(measure.actualBoundingBoxAscent) + measure.actualBoundingBoxDescent);
            tmpCanvas.height = minCanvasHeight;

            tmpContext.font = font;
            tmpContext.fillStyle = "#fff";
            tmpContext.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            tmpContext.fillStyle = "#000";
            tmpContext.textBaseline = "top";
            tmpContext.textAlign = "center";
            tmpContext.fillText("あ", tmpCanvas.width / 2, 0);
            const tmpPixels = tmpContext.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height)
            return this.#trimming(tmpPixels);
        })();

        // 各文字の幅、高さの抽出とか
        let tmpCanvasWidth = 0;
        let tmpCanvasHeight = 0;
        const charList = [];
        for (const char of text) {
            tmpContext.font = font;
            tmpContext.textBaseline = "top";
            tmpContext.textAlign = "center";
            const measure = tmpContext.measureText(char);
            const width = measure.width;
            const height = Math.abs(measure.actualBoundingBoxAscent) + measure.actualBoundingBoxDescent;
            charList.push({
                value: char,
                width: width,
                height: height
            });
            if (tmpCanvasWidth < width) {
                tmpCanvasWidth = width;
            }
            tmpCanvasHeight += Math.max(height, standardCharHeight);
        }

        tmpCanvas.width = Math.ceil(tmpCanvasWidth);
        tmpCanvas.height = Math.ceil(tmpCanvasHeight) + tateMargin * (charList.length - 1);
        tmpContext.fillStyle = "#fff";
        tmpContext.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

        let dstY = 0;
        //let srcX = 0;
        let maxWidth = 0;
        let totalHeight = tateMargin * (charList.length - 1);
        for (const char of charList) {
            const isSmallChar = "、。っゃゅょぁぃぅぇぉッャュョァィゥェォ".includes(char.value);

            this.#canvas.width = Math.ceil(char.width);
            this.#canvas.height = Math.max(Math.ceil(char.height), minCanvasHeight);

            // テキスト反映
            this.#context.font = font;
            this.#context.fillStyle = "#fff";
            this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#context.fillStyle = "#000";
            this.#context.textBaseline = "top";
            this.#context.textAlign = "center";
            this.#context.fillText(char.value, this.#canvas.width / 2, 0);
            // トリミング
            const trimmed = this.#trimming(this.pixels);

            // 転写
            let dstX = (tmpCanvas.width - trimmed.width) / 2;

            debug(`dstX: ${dstX}`);
            debug(`tmpCanvas.width: ${tmpCanvas.width}`);
            debug(`trimmed.width: ${trimmed.width}`);

            if (isSmallChar) {
                dstX = (tmpCanvas.width - standardCharWidth) / 2 + standardCharWidth - trimmed.width;
            }
            
            // 漢数字の「一」みたいな文字は必要な余白すら切り取られてしまうので対策
            let isLargeMarginChar = !isSmallChar && trimmed.height < standardCharHeight;
            const prevDestY = dstY;
            if (isLargeMarginChar) {
                dstY += (standardCharHeight - trimmed.height) / 2;
            }

            // tmpContext.putImageData(this.#context.getImageData(trimmed.x, trimmed.y, trimmed.width, trimmed.height), dstX, dstY);
            tmpContext.putImageData(this.#context.getImageData(trimmed.x, trimmed.y, trimmed.width, trimmed.height), 0, dstY);

            if (isLargeMarginChar) {
                dstY = prevDestY;
                dstY += standardCharHeight + tateMargin;
                totalHeight += standardCharHeight;
            }
            else {
                dstY += trimmed.height + tateMargin;
                totalHeight += trimmed.height;
            }

            if (maxWidth < trimmed.width) {
                //srcX = trimmed.x;
                maxWidth = trimmed.width;
            }
        }

        return;

        let yokoMargin = 4;
        // 数字の「1」みたいな文字は必要な余白すら切り取られてしまうので対策
        if (maxWidth < standardCharWidth) {
            yokoMargin += (standardCharWidth - maxWidth) / 2;
        }
        this.#canvas.width = maxWidth + yokoMargin * 2;

        // debug 実験
        this.#canvas.width = tmpCanvas.width

        this.#canvas.height = totalHeight + tateMargin * 2;
        this.#context.fillStyle = "#fff";
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
        // const srcX = (tmpCanvas.width - maxWidth) / 2; // todo trimmed.xでは？

        // todo
        // センターをセンターにペタって貼ればいいじゃん。（いいじゃん。）
        // srcXはいらない

        debug(`tmpCanvas.width: ${tmpCanvas.width}`);
        debug(`maxWidth: ${maxWidth}`);
        debug(`this.#canvas.width: ${this.#canvas.width}`);

        // this.#context.putImageData(tmpContext.getImageData(srcX, 0, maxWidth, totalHeight), yokoMargin, tateMargin);
        // this.#context.putImageData(tmpContext.getImageData(srcX, 0, maxWidth, totalHeight), yokoMargin, tateMargin);
        const dstX = (this.#canvas.width - tmpCanvas.width) / 2;
        this.#context.putImageData(tmpContext.getImageData(0, 0, tmpCanvas.width, totalHeight), dstX, tateMargin);
        // if (dstX >= 0) {
        //     this.#context.putImageData(tmpContext.getImageData(0, 0, tmpCanvas.width, totalHeight), dstX, tateMargin);
        // }
        // else {
        //     // dstXではいけない説
        //     this.#context.putImageData(tmpContext.getImageData(-dstX, 0, tmpCanvas.width, totalHeight), 0, tateMargin);
        // }
    }

    #trimming(pixels) {
        const data = pixels.data;
        let targetLeftX = -1;
        let targetRightX = -1;
        let targetTopY = -1;
        let targetBottomY = -1;

        // left-xを求める
        for (let col = 0; col < pixels.width; col++) {
            for (let row = 0; row < pixels.height; row++) {
                const i = row * pixels.width * 4 + col * 4;
                if (data[i] === 0) {
                    targetLeftX = col;
                    break;
                }
            }
            if (targetLeftX !== -1) {
                break;
            }
        }

        if (targetLeftX === -1) {
            throw new Error("文字がない！！真っ白！！");
        }

        // right-xを求める
        for (let col = pixels.width - 1; col >= 0; col--) {
            for (let row = 0; row < pixels.height; row++) {
                const i = row * pixels.width * 4 + col * 4;
                if (data[i] === 0) {
                    targetRightX = col;
                    break;
                }
            }
            if (targetRightX !== -1) {
                break;
            }
        }

        // top-yを求める
        for (let row = 0; row < pixels.height; row++) {
            for (let col = targetLeftX; col <= targetRightX; col++) {
                const i = row * pixels.width * 4 + col * 4;
                if (data[i] === 0) {
                    targetTopY = row;
                    break;
                }
            }
            if (targetTopY !== -1) {
                break;
            }
        }

        // bottom-yを求める
        for (let row = pixels.height - 1; row >= 0; row--) {
            for (let col = targetLeftX; col <= targetRightX; col++) {
                const i = row * pixels.width * 4 + col * 4;
                if (data[i] === 0) {
                    targetBottomY = row;
                    break;
                }
            }
            if (targetBottomY !== -1) {
                break;
            }
        }

        return {
            x: targetLeftX, y: targetTopY,
            width: targetRightX - targetLeftX + 1,
            height: targetBottomY - targetTopY + 1
        };
    }

    #yokoText(text, font, tateMargin = 4) {
        this.#context.font = font;
        this.#context.textBaseline = "top";
        const measure = this.#context.measureText(text)
        // キャンバスのサイズ設定
        this.#canvas.width = measure.width;
        this.#canvas.height = Math.abs(measure.actualBoundingBoxAscent) + measure.actualBoundingBoxDescent;
        // テキスト反映
        this.#context.font = font;
        this.#context.fillStyle = "#fff";
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#context.fillStyle = "#000";
        this.#context.textBaseline = "middle";
        this.#context.textAlign = "center";
        this.#context.fillText(text, this.#canvas.width / 2, this.#canvas.height / 2);

        const trimmed = this.#trimming(this.pixels);
        const pixels = this.#context.getImageData(0, trimmed.y, this.#canvas.width, trimmed.height);

        this.#canvas.height = trimmed.height + tateMargin * 2;
        this.#context.fillStyle = "#fff";
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#context.putImageData(pixels, 0, tateMargin);
    }

    image(src, resizeImageWidth, resizeImageHeight, baseAverageColor = 90, needOutline = true, baseColorDistance = 50) {
        return new Promise((resolve, reject) => {
            if (this.#isProcessing) {
                return reject(new Error("まだ前の処理をしている最中"));
            }
            this.#isProcessing = true;

            const img = new Image();
            img.src = src;

            img.onload = () => {
                // キャンバスに画像を貼る
                if (resizeImageWidth == null || resizeImageHeight == null) {
                    resizeImageWidth = img.width;
                    resizeImageHeight = img.height;
                }
                this.#canvas.width = resizeImageWidth;
                this.#canvas.height = resizeImageHeight;
                this.#context.fillStyle = "#fff"; // 透過画像対策
                this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
                this.#context.drawImage(img, 0, 0, img.width, img.height, 0, 0, resizeImageWidth, resizeImageHeight);

                // 画像の各ピクセルをグレースケールに変換する
                const pixels = this.pixels;
                for (let row = 0; row < pixels.height; row++) {
                    for (let col = 0; col < pixels.width; col++) {
                        const i = row * pixels.width * 4 + col * 4;

                        if (needOutline) {
                            this.#outline(pixels, i, baseColorDistance);
                        }
                        this.#monochrome(pixels, i, baseAverageColor);
                    }
                }
                this.#context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
                this.#isProcessing = false;
                resolve();
            };
            img.onerror = e => {
                this.#isProcessing = false;
                reject(e);
            };
        });
    }

    #monochrome(pixels, i, baseAverageColor) {
        const data = pixels.data;
        const avgColor = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
    
        let newColor = avgColor < baseAverageColor ? 0 : 255;
    
        data[i] = data[i + 1] = data[i + 2] = newColor;
    };
    
    #outline(pixels, i, baseColorDistance) {
        const data = pixels.data;
        const rightIdx = i + 4;
        const underIdx = i + pixels.width * 4;
    
        const existsRight = (i / 4 + 1) % pixels.width !== 0;
        const existsUnder = i <= pixels.width * 4 * (pixels.height - 1);
    
        let didChangeColor = false;
        if (existsRight) {
            if (this.#colorDistance(data, i, rightIdx) > baseColorDistance) {
                data[i] = data[i + 1] = data[i + 2] = 0;
                didChangeColor = true;
            }
        }
        if (!didChangeColor && existsUnder) {
            if (this.#colorDistance(data, i, underIdx) > baseColorDistance) {
                data[i] = data[i + 1] = data[i + 2] = 0;
            }
        }
    };
    
    // 3次元空間の距離を求める
    // ちなみに最大値は441.6729559300637
    #colorDistance(data, oriIdx, dstIdx) {
        return Math.sqrt(
            Math.pow((data[oriIdx] - data[dstIdx]), 2) +
            Math.pow((data[oriIdx + 1] - data[dstIdx + 1]), 2) +
            Math.pow((data[oriIdx + 2] - data[dstIdx + 2]), 2)
        );
    };
}