
let monoCanvas = null;
let tukiArtGenerator = new TukiArtGenerator();

const App = {
    data() {
        return {
            file: null,
            fileReader: new FileReader(),
            baseAverageColor: 90,
            baseAverageColorPrev: 90,
            baseAverageColorMin: 0,
            baseAverageColorMax: 255,
            baseColorDistance: 50,
            baseColorDistancePrev: 50,
            baseColorDistanceMin: 0,
            baseColorDistanceMax: 200,
            needOutline: true,
            imageWidthOri: 0,
            imageHeightOri: 100,
            imageWidth: 100,
            imageWidthPrev: 100,
            imageWidthMin: 100,
            imageWidthMax: 1280,
            imageSizeRate: 1,
            imageSizeRatePrev: 1,
            imageSizeRateMin: 0.1,
            imageSizeRateMax: Math.floor(1280 * 10 / 100) / 10, // Math.floor(imageWidthMax * 10 / imageWidthMin) / 10
        }
    },
    mounted() {
        monoCanvas = new MonochromeCanvas(this.$refs.canvas);
        // monoCanvas.monochrome("野獣先輩.png").then(() => {
        //     const tukimojiText = tukiArtGenerator.generate(monoCanvas.pixels);
        //     console.log(tukimojiText);
        // });
        //monoCanvas.text("草生えるwwwWWW");
        //monoCanvas.text("草");
        // monoCanvas.text("月");
        monoCanvas.text("全身全霊今日も青春");
        const tukimojiText = tukiArtGenerator.generate(monoCanvas.pixels);
        console.log(tukimojiText);
    },
    watch: {
        baseAverageColor(newVal) {
            if (newVal === "") return; this.baseAverageColorPrev = newVal;
        },
        baseColorDistance(newVal) {
            if (newVal === "") return; this.baseColorDistancePrev = newVal;
        },
        imageWidth(newVal) {
            if (newVal === "") return; this.imageWidthPrev = newVal;
        },
        imageSizeRate(newVal) {
            if (newVal === "") return; this.imageSizeRatePrev = newVal;
        }
    },
    methods: {
        onChangeInputFile(e) {
            this.file = e.target.files[0];

            const img = new Image();

            img.onload = () => {
                if (img.width < this.imageWidthMin || img.width > this.imageWidthMax) {
                    alert(`画像の幅は${this.imageWidthMin}px以上${this.imageWidthMax}px以下の必要があります`);
                    this.$refs.inputFile.value = "";
                    this.file = null;
                    this.imageWidth = this.imageWidthMin;
                }
                else {
                    this.imageWidth = this.imageWidthOri = img.width;
                    this.imageHeightOri = img.height;
                    this.imageSizeRateMin = Math.ceil(this.imageWidthMin * 10 / this.imageWidth) / 10;
                    this.imageSizeRateMax = Math.floor(this.imageWidthMax * 10 / this.imageWidth) / 10;
                }
                this.imageSizeRate = 1;
                
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
            };

            img.src = URL.createObjectURL(this.file);
        },
        onBlurBaseAverageColorNumber(e) {
            if (e.target.value === "") {
                this.baseAverageColor = this.baseAverageColorPrev;
                return;
            }
            this.baseAverageColor = this.rangeCorrection(
                Number(e.target.value),
                this.baseAverageColorMin,
                this.baseAverageColorMax
            );
        },
        onBlurBaseColorDistanceNumber(e) {
            if (e.target.value === "") {
                this.baseColorDistance = this.baseColorDistancePrev;
                return;
            }
            this.baseColorDistance = this.rangeCorrection(
                Number(e.target.value),
                this.baseColorDistanceMin,
                this.baseColorDistanceMax
            );
        },
        onBlurImageWidth(e) {
            if (e.target.value === "") {
                this.imageWidth = this.imageWidthPrev;
                return;
            }
            this.imageWidth = this.rangeCorrection(
                Number(e.target.value),
                this.imageWidthMin,
                this.imageWidthMax
            );
            if (this.file !== null) {
                this.imageSizeRate = Math.floor(this.imageWidth * 10 / this.imageWidthOri) / 10;
            }
        },
        onBlurImageSizeRate(e) {
            if (e.target.value === "") {
                this.imageSizeRate = this.imageSizeRatePrev;
                return;
            }
            this.imageSizeRate = this.rangeCorrection(
                Number(e.target.value),
                this.imageSizeRateMin,
                this.imageSizeRateMax
            );
            if (this.file !== null) {
                this.imageWidth = Math.round(this.imageWidthOri * this.imageSizeRate);
            }
        },
        onClickMonochromeButton() {
            if (this.file == null || this.imageWidth === 0) {
                return;
            }
        
            this.fileReader.readAsDataURL(this.file);
        
            this.fileReader.onload = () => {
                monoCanvas.monochrome(
                    this.fileReader.result,
                    this.imageWidth,
                    Math.round(this.imageHeightOri * this.imageWidth / this.imageWidthOri),
                    this.baseAverageColor,
                    this.needOutline,
                    this.baseColorDistance
                ).then(() => {
                    const tukimojiText = tukiArtGenerator.generate(monoCanvas.pixels);
                    console.log(tukimojiText);
                });
            }
        },
        rangeCorrection(val, min, max) {
            if (val < min) {
                return min;
            }
            else if (val > max) {
                return max;
            }
            return val;
        }
    }
};

Vue.createApp(App).mount("#app");
