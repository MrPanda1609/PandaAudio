package com.panda.audio;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Plugin bật/tắt foreground service giữ audio dưới nền. */
@CapacitorPlugin(name = "BackgroundAudio")
public class BackgroundAudioPlugin extends Plugin {

    @PluginMethod
    public void enable(PluginCall call) {
        String title = call.getString("title", "PandaAudio");
        String text = call.getString("text", "Đang phát truyện audio");
        Intent i = new Intent(getContext(), MediaPlaybackService.class);
        i.putExtra("title", title);
        i.putExtra("text", text);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(i);
        } else {
            getContext().startService(i);
        }
        call.resolve(new JSObject().put("enabled", true));
    }

    @PluginMethod
    public void disable(PluginCall call) {
        Intent i = new Intent(getContext(), MediaPlaybackService.class);
        getContext().stopService(i);
        call.resolve(new JSObject().put("enabled", false));
    }
}
