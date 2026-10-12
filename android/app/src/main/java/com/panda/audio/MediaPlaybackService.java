package com.panda.audio;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Foreground service giữ WebView + audio sống khi app xuống nền / tắt màn hình.
 * Hiện notification MediaStyle với nút Play/Pause điều khiển được từ màn hình khóa.
 */
public class MediaPlaybackService extends Service {
    public static final String CHANNEL_ID = "panda_audio_playback";
    public static final int NOTIF_ID = 1001;
    public static final String ACTION_TOGGLE = "com.panda.audio.TOGGLE_PLAYBACK";

    private boolean isPlaying = true;
    private String title = "PandaAudio";
    private String text = "Đang phát truyện audio";

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            if (ACTION_TOGGLE.equals(intent.getAction())) {
                // Đảo trạng thái và báo cho WebView qua plugin
                isPlaying = !isPlaying;
                BackgroundAudioPlugin.notifyToggle(isPlaying);
                updateNotification();
                return START_STICKY;
            }
            String t = intent.getStringExtra("title");
            if (t != null) title = t;
            String x = intent.getStringExtra("text");
            if (x != null) text = x;
            if (intent.hasExtra("playing")) isPlaying = intent.getBooleanExtra("playing", true);
        }
        startForegroundWithNotification();
        return START_STICKY;
    }

    private void startForegroundWithNotification() {
        Notification notif = buildNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notif,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIF_ID, notif);
        }
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIF_ID, buildNotification());
    }

    private Notification buildNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPi = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Nút Play/Pause
        Intent toggleIntent = new Intent(this, MediaPlaybackService.class);
        toggleIntent.setAction(ACTION_TOGGLE);
        PendingIntent togglePi = PendingIntent.getService(
            this, 1, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        int icon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String actionTitle = isPlaying ? "Tạm dừng" : "Phát tiếp";

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🐼 " + title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(contentPi)
            .addAction(icon, actionTitle, togglePi)
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setShowActionsInCompactView(0))
            .setOngoing(true)
            .setSilent(true)
            .build();
    }

    @Override
    public void onDestroy() {
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "Đang phát", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Điều khiển phát truyện dưới nền");
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }
}
