const { abs } = Math;
let button = null;

window.FirstFrame = {
    renderFirstFrame,
    stopRenderingFirstFrame
};

function renderFirstFrame() {
    console.log('START');
    wx.showLoading({ title: ('Loading') + '...', mask: true });

    const gl = window.canvas.getContext('webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const info = wx.getSystemInfoSync();
    const ratio = info.screenHeight / info.screenWidth;
    const a = abs(ratio - 16 / 9);
    const b = abs(ratio - 2.15);
    const url = a < b ? 'image/ff-169.png' : 'image/ff-215.png';
    button = wx.createUserInfoButton({
        type: 'image',
        style: {
            top: 0,
            left: 0,
            width: window.canvas.width,
            height: window.canvas.height,
        },
        image: url
    })
    button.show();
};

function stopRenderingFirstFrame() {
    console.log('END');
    wx.hideLoading();
    if (button) {
        button.hide();
        button.destroy();
    }
}