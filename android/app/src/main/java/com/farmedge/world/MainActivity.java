package com.farmedge.world;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        String live = AppUpdatePlugin.getSavedLivePath(this);
        if (live != null && this.bridge != null) {
            this.bridge.setServerBasePath(live);
        }
    }
}
