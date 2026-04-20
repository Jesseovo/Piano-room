package com.bookingsystem.enums;

import com.bookingsystem.pojo.BasicSetting;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.pojo.SecuritySetting;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public enum SettingsEnums {


    BASE_SETTING("baseSetting", BasicSetting.class, BasicSetting::new),
    RESERVATION_SETTING("reservationSetting", ReservationSetting.class, ReservationSetting::new),
    SECURITY_SETTING("securitySetting", SecuritySetting.class, SecuritySetting::new);

    private String name;
    private Supplier<Object> defaultSupplier;
    private  Class type;

    SettingsEnums(String name, Class type, Supplier<Object> defaultSupplier) {
        this.name = name;
        this.type = type;
        this.defaultSupplier = defaultSupplier;
    }

    public Class getType() {
        return type;
    }
    public String getName() {
        return name;
    }

    public Object createDefaultValue() {
        return defaultSupplier.get();
    }

    public static SettingsEnums getByName(String name) {
        for (SettingsEnums setting : SettingsEnums.values()) {
            if (setting.getName().equals(name)) {
                return setting;
            }
        }
        return null;
    }

    public static SettingsEnums getByValue(Class<?> value) {
        for (SettingsEnums setting : SettingsEnums.values()) {
            if (setting.getType().equals(value)) {
                return setting;
            }
        }
        return null;
    }


    public static List<SettingsEnums>  getAll(){
        List<SettingsEnums> list = Arrays.asList(SettingsEnums.values());
        return list;
    }


}
