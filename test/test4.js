(function() {
    const tukiArtGenerator = new TukiArtGenerator();

    module("4.月変換 細い横線縦線考慮");

    test("🌑", function() {
        const pixels = [
            [W, W, W, W],
            [W, W, W, W],
            [B, B, W, W],
            [B, B, B, B],
        ];
        strictEqual(tukiArtGenerator._convertTuki(pixels, true, true), "🌑");
    });
    
    test("🌓", function() {
        const pixels = [
            [W, B, W, W],
            [W, B, W, W],
            [W, B, W, W],
            [W, B, W, W],
        ];
        strictEqual(tukiArtGenerator._convertTuki(pixels, true, true), "🌓");
    });
})();
