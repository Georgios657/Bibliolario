package bookClubWebseite.BookClubBook;

import java.util.HashMap;
import java.util.Map;

public class LanguageMapper {

    private static final Map<String, String> OPENLIBRARY_TO_ISO = new HashMap<>();

    static {
        OPENLIBRARY_TO_ISO.put("eng", "en");
        OPENLIBRARY_TO_ISO.put("ger", "de");
        OPENLIBRARY_TO_ISO.put("deu", "de");
        OPENLIBRARY_TO_ISO.put("fre", "fr");
        OPENLIBRARY_TO_ISO.put("fra", "fr");
        OPENLIBRARY_TO_ISO.put("ita", "it");
        OPENLIBRARY_TO_ISO.put("spa", "es");
        OPENLIBRARY_TO_ISO.put("por", "pt");
        OPENLIBRARY_TO_ISO.put("dut", "nl");
        OPENLIBRARY_TO_ISO.put("nld", "nl");
        OPENLIBRARY_TO_ISO.put("swe", "sv");
        OPENLIBRARY_TO_ISO.put("dan", "da");
        OPENLIBRARY_TO_ISO.put("nor", "no");
        OPENLIBRARY_TO_ISO.put("fin", "fi");
        OPENLIBRARY_TO_ISO.put("rus", "ru");
        OPENLIBRARY_TO_ISO.put("pol", "pl");
        OPENLIBRARY_TO_ISO.put("cze", "cs");
        OPENLIBRARY_TO_ISO.put("ces", "cs");
        OPENLIBRARY_TO_ISO.put("slv", "sl");
        OPENLIBRARY_TO_ISO.put("slk", "sk");
        OPENLIBRARY_TO_ISO.put("hun", "hu");
        OPENLIBRARY_TO_ISO.put("ron", "ro");
        OPENLIBRARY_TO_ISO.put("rum", "ro");
        OPENLIBRARY_TO_ISO.put("bul", "bg");
        OPENLIBRARY_TO_ISO.put("ukr", "uk");
        OPENLIBRARY_TO_ISO.put("hrv", "hr");
        OPENLIBRARY_TO_ISO.put("srp", "sr");
        OPENLIBRARY_TO_ISO.put("ell", "el");
        OPENLIBRARY_TO_ISO.put("grc", "el");
        OPENLIBRARY_TO_ISO.put("tur", "tr");
        OPENLIBRARY_TO_ISO.put("heb", "he");
        OPENLIBRARY_TO_ISO.put("ara", "ar");
        OPENLIBRARY_TO_ISO.put("hin", "hi");
        OPENLIBRARY_TO_ISO.put("ben", "bn");
        OPENLIBRARY_TO_ISO.put("tam", "ta");
        OPENLIBRARY_TO_ISO.put("tel", "te");
        OPENLIBRARY_TO_ISO.put("kor", "ko");
        OPENLIBRARY_TO_ISO.put("jpn", "ja");
        OPENLIBRARY_TO_ISO.put("chi", "zh"); // Chinese (unspezifisch)
        OPENLIBRARY_TO_ISO.put("zho", "zh"); // ISO form
        OPENLIBRARY_TO_ISO.put("tha", "th");
        OPENLIBRARY_TO_ISO.put("vie", "vi");
        OPENLIBRARY_TO_ISO.put("ind", "id");
        OPENLIBRARY_TO_ISO.put("msa", "ms");
        OPENLIBRARY_TO_ISO.put("lat", "la");
        OPENLIBRARY_TO_ISO.put("isl", "is");
        OPENLIBRARY_TO_ISO.put("gle", "ga");
        OPENLIBRARY_TO_ISO.put("yid", "yi");
        OPENLIBRARY_TO_ISO.put("amh", "am");
        OPENLIBRARY_TO_ISO.put("eus", "eu");
        OPENLIBRARY_TO_ISO.put("glg", "gl");
        OPENLIBRARY_TO_ISO.put("cat", "ca");
        OPENLIBRARY_TO_ISO.put("wel", "cy");
        OPENLIBRARY_TO_ISO.put("cym", "cy");
        OPENLIBRARY_TO_ISO.put("est", "et");
        OPENLIBRARY_TO_ISO.put("lit", "lt");
        OPENLIBRARY_TO_ISO.put("lav", "lv");
    }

    /**
     * Konvertiert OpenLibrary-Sprachcode → ISO 639-1
     * Gibt Standard-"unknown" zurück, wenn nicht gefunden.
     */
    public static String toIso639(String openLibCode) {
        if (openLibCode == null) return "unknown";
        return OPENLIBRARY_TO_ISO.getOrDefault(openLibCode.toLowerCase(), "unknown");
    }
}
