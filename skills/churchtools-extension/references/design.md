# Design

## Farben der Gemeinde übernehmen
Wenn der Benutzer Farben nennt oder eine Website/ein Logo zeigt, diese als CSS-Variablen auf der Wurzelklasse setzen:

```css
.ct-ext {
  --ct-primary: #2d6a8f;   /* Hauptfarbe: Kopfbereich, Überschriften */
  --ct-accent:  #e0a526;   /* Akzente, Buttons */
  --ct-text:    #1f2933;
  --ct-muted:   #6b7680;
  --ct-bg:      #ffffff;
  --ct-surface: #f5f7f9;
  font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--ct-text);
}
```

## Neutrales Standarddesign
Ohne Vorgaben die Werte oben verwenden. Sie passen zur ChurchTools-Oberfläche, ohne mit ihr zu konkurrieren.

## Grundregeln
- Kopfbereich: Balken in `--ct-primary` mit dünner Unterkante in `--ct-accent`.
- Karten mit leichtem Rand statt starker Schatten; großzügiger Innenabstand.
- Buttons mindestens 40 px hoch (Touch).
- Kontrast Text/Hintergrund mindestens 4.5:1.
- Keine fremden Logos oder Markenzeichen ohne Erlaubnis der Gemeinde.
