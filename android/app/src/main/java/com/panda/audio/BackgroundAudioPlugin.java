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

    private static BackgroundAudioPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    /** Service gọi khi user bấm Play/Pause trên notification/màn hình khóa. */
    public static void notifyToggle(boolean playing) {
        if (instance != null && instance.getBridge() != null) {
            final boolean p = playing;
            instance.getBridge().executeOnMainThread(() ->
                instance.getBridge().eval(
                    "window.dispatchEvent(new CustomEvent('panda-native-toggle',{detail:{playing:" + p + "}}))",
                    null
                )
            );
        }
    }

    /** Service gọi khi user bấm ✕ đóng hoặc vuốt ẩn notification → WebView dừng audio hẳn. */
    public static void notifyClose() {
        if (instance != null && instance.getBridge() != null) {
            instance.getBridge().executeOnMainThread(() ->
                instance.getBridge().eval(
                    "window.dispatchEvent(new CustomEvent('panda-native-close'))",
                    null
                )
            );
        }
    }

    /** Cập nhật trạng thái play/pause của notification (đồng bộ icon). */
    @PluginMethod
    public void setPlaying(PluginCall call) {
        boolean playing = call.getBoolean("playing", true);
        Intent i = new Intent(getContext(), MediaPlaybackService.class);
        i.putExtra("playing", playing);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(i);
        } else {
            getContext().startService(i);
        }
        call.resolve(new JSObject().put("playing", playing));
    }

    @PluginMethod
    public void enable(PluginCall call) {
        String title = call.getString("title", "PandaAudio");
        String text = call.getString("text", "Đang phát truyện audio");
        Intent i = new Intent(getContext(), MediaPlaybackService.class);
        i.putExtra("title", title);
        i.putExtra("text", text);
        i.putExtra("playing", true);
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
