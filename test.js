/* eslint-disable complexity */
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const ffprobeAsync = promisify(ffmpeg.ffprobe)
const exec = promisify(require('child_process').exec)

const duetteUrl = 'https://duette.s3.us-east-2.amazonaws.com/IMG_2838.MOV';
const accompanimentUrl = 'https://duette.s3.us-east-2.amazonaws.com/IMG_2838.MOV';
const delay = 200;
const logoUrl = 'https://duette.s3.us-east-2.amazonaws.com/made-with-duette-300x200.png'

const combinedCommand = async () => {

  const file1Info = {
    originalName: 'IMG_2838.MOV',
    orientation: '',
    height: null,
    width: null,
    isTallest: false,
    duration: null,
  };
  const file2Info = {
    originalName: 'IMG_2838.MOV',
    orientation: '',
    trueHeight: null,
    trueWidth: null,
    croppedHeight: null,
    croppedWidth: null,
    offset: null,
    isTallest: false,
    duration: null,
  };

  try {

    // get metadata on vid 1
    const metadata = await ffprobeAsync(accompanimentUrl)

    file1Info.orientation = metadata.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file1Info.width = file1Info.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
    file1Info.height = file1Info.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;
    file1Info.duration = metadata.streams[0].duration;

    // get metadata on vid 2
    const metadata2 = await ffprobeAsync(duetteUrl)

    file2Info.orientation = metadata2.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file2Info.trueWidth = file2Info.orientation === 'portrait' ? metadata2.streams[0].height : metadata2.streams[0].width;
    file2Info.trueHeight = file2Info.orientation === 'portrait' ? metadata2.streams[0].width : metadata2.streams[0].height;
    file2Info.croppedHeight = file2Info.orientation === 'portrait' ? (file2Info.trueWidth / 8) * 9 : file2Info.trueHeight;
    file2Info.croppedWidth = file2Info.croppedHeight / 9 * 8;
    file2Info.offset = file2Info.orientation === 'portrait' ? (file2Info.trueHeight - file2Info.croppedHeight) / 2 : (file2Info.trueWidth - file2Info.croppedWidth) / 2;
    file2Info.duration = metadata2.streams[0].duration;

    // if vid croppedHeight is not divisible by 2, reduce by 1px
    if (file1Info.height % 2 === 1) file1Info.height--;
    if (file2Info.croppedHeight % 2 === 1) file2Info.croppedHeight--;

    // note which file will be tallest (largest height res) after cropping
    if (file1Info.height > file2Info.croppedHeight) file1Info.isTallest = true;
    if (file2Info.croppedHeight > file1Info.height) file2Info.isTallest = true;

    console.log('file1Info: ', file1Info);
    console.log('file2Info: ', file2Info);

    const command = `ffmpeg -i ${duetteUrl} ${delay ? `-ss ${delay}ms -t ${file2Info.duration}` : ''} -i ${accompanimentUrl} -i ${logoUrl} -filter_complex "[1]crop=${file2Info.orientation === 'portrait' ? 'iw' : file2Info.croppedWidth}:${file2Info.orientation === 'portrait' ? file2Info.croppedHeight : 'ih'}:${file2Info.orientation === 'portrait' ? 0 : file2Info.offset}:${file2Info.orientation === 'portrait' ? file2Info.offset : 0},scale=-2:${file1Info.height < file2Info.croppedHeight ? file2Info.croppedHeight : file1Info.height}[${file1Info.height < file2Info.croppedHeight ? 'left' : 'right'}];[0][${file1Info.height < file2Info.croppedHeight ? 'left' : 'right'}]hstack=inputs=2,fade=t=in:duration=1,fade=t=out:start_time=${file2Info.duration > file1Info.duration ? file2Info.duration - 1 : file1Info.duration - 1}:duration=1[bg];[bg][2]overlay=W-w-10:H-h-10:format=auto,format=yuv420p[v];[0:a][1:a]amix,afade=t=in:duration=1,afade=t=out:start_time=${file2Info.duration > file1Info.duration ? file2Info.duration - 1 : file1Info.duration - 1}:duration=1[a]" -map "[v]" -map "[a]" -c:v libx264 -preset ultrafast -c:a aac -ac 2 -movflags +faststart output.mov`

    console.log('command: ', command);

    await exec(command);
  } catch (e) {
    console.log('error: ', e)
  }
}

combinedCommand();
