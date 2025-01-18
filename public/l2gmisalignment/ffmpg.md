ffmpeg -framerate 1 -i image1.png -framerate 1 -i image2.png -filter_complex "[0:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB[v0]; [1:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB[v1]; [v0][v1]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" output.mp4
ffmpeg -framerate 1 -i image1.png -framerate 1 -i image2.png -filter_complex "[0:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2[v0]; [1:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2[v1]; [v0][v1]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" output.mp4


ffmpeg -framerate 1 -i image1.png -framerate 1 -i image2.png -filter_complex "[0:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB[v0]; [1:v]loop=loop=5:size=5:start=0,setpts=N/FRAME_RATE/TB[v1]; [v0][v1]interleave=v=2:a=0,format=yuv420p[v]" -map "[v]" output.mp4
