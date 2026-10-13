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
 * Notification MediaStyle: nút Play/Pause + nút ✕ đóng hẳn (dừng audio, gỡ thông báo).
 * Khi đang pause: vuốt để ẩn được (delete intent sẽ dừng service).
 */
public class MediaPlaybackService extends Service {
    public static final String CHANNEL_ID = "panda_audio_playback";
    public static final int NOTIF_ID = 1001;
    public static final String ACTION_TOGGLE = "com.panda.audio.TOGGLE_PLAYBACK";
    public static final String ACTION_CLOSE = "com.panda.audio.CLOSE_PLAYBACK";

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
            String action = intent.getAction();
            if (ACTION_CLOSE.equals(action)) {
                // Đóng hẳn: báo WebView dừng audio, gỡ notification, dừng service
                BackgroundAudioPlugin.notifyClose();
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }
            if (ACTION_TOGGLE.equals(action)) {
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

    private PendingIntent serviceIntent(String action, int reqCode) {
        Intent i = new Intent(this, MediaPlaybackService.class);
        i.setAction(action);
        return PendingIntent.getService(
            this, reqCode, i,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private Notification buildNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPi = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Nút Play/Pause
        int icon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String actionTitle = isPlaying ? "Tạm dừng" : "Phát tiếp";

        // Vuốt ẩn notification khi đang pause → cũng dừng service luôn
        PendingIntent deletePi = serviceIntent(ACTION_CLOSE, 2);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🐼 " + title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(contentPi)
            .addAction(icon, actionTitle, serviceIntent(ACTION_TOGGLE, 1))
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Đóng", serviceIntent(ACTION_CLOSE, 3))
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setShowActionsInCompactView(0, 1))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setDeleteIntent(deletePi)
            .setSilent(true);

        // Đang phát: không cho vuốt (tránh tắt nhầm) — có nút ✕ để đóng hẳn.
        // Đang pause: cho vuốt ẩn.
        b.setOngoing(isPlaying);

        return b.build();
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
