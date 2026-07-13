export type Lang = "bg" | "en" | "de" | "fr" | "ru";

export const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "bg", flag: "🇧🇬", label: "Български" },
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "de", flag: "🇩🇪", label: "Deutsch" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "ru", flag: "🇷🇺", label: "Русский" },
];

type Dict = Record<string, Record<Lang, string>>;

const D: Dict = {
  // ---- Hero / Home ----
  badge: { bg: "✨ Над 1 200 създадени приказки", en: "✨ Over 1,200 stories created", de: "✨ Über 1.200 Geschichten erstellt", fr: "✨ Plus de 1 200 histoires créées", ru: "✨ Более 1 200 созданных сказок" },
  h1a: { bg: "Само едно дете", en: "Only one child", de: "Nur ein Kind", fr: "Un seul enfant", ru: "Только один ребёнок" },
  h1b: { bg: "е героят.", en: "is the hero.", de: "ist der Held.", fr: "est le héros.", ru: "— герой." },
  h1c: { bg: "Твоето.", en: "Yours.", de: "Deins.", fr: "Le tien.", ru: "Твой." },
  sub: { bg: "Кажи ни името и любимия свят на детето — и за минута получаваш приказка, написана, илюстрирана и разказана само за него.", en: "Tell us your child's name and favourite world — and in a minute you get a story written, illustrated and narrated just for them.", de: "Nenne uns den Namen und die Lieblingswelt deines Kindes — und in einer Minute bekommst du eine Geschichte, geschrieben, illustriert und erzählt nur für dein Kind.", fr: "Donne-nous le prénom et l'univers préféré de ton enfant — et en une minute tu reçois une histoire écrite, illustrée et racontée rien que pour lui.", ru: "Назови имя и любимый мир ребёнка — и через минуту получишь сказку, написанную, иллюстрированную и озвученную только для него." },
  subComic: { bg: "Кажи ни името и любимия свят на детето — и за минути получаваш цял комикс, в който то е супергероят.", en: "Tell us your child's name and favourite world — and in minutes you get a whole comic where they're the superhero.", de: "Nenne uns den Namen und die Lieblingswelt deines Kindes — und in Minuten bekommst du einen ganzen Comic, in dem es der Superheld ist.", fr: "Donne-nous le prénom et l'univers préféré de ton enfant — et en quelques minutes tu reçois une BD entière où il est le super-héros.", ru: "Назови имя и любимый мир ребёнка — и через пару минут получишь целый комикс, где он супергерой." },
  appTagStory: { bg: "Приказки", en: "Stories", de: "Geschichten", fr: "Histoires", ru: "Сказки" },
  appTagComic: { bg: "Комикси", en: "Comics", de: "Comics", fr: "BD", ru: "Комиксы" },
  login: { bg: "Вход", en: "Sign in", de: "Anmelden", fr: "Connexion", ru: "Вход" },
  doorStoryTitle: { bg: "Вечерна приказка", en: "Bedtime Story", de: "Gute-Nacht-Geschichte", fr: "Histoire du soir", ru: "Вечерняя сказка" },
  doorStoryDesc: { bg: "За слушане преди сън — с илюстрации и глас", en: "For bedtime listening — with pictures and voice", de: "Zum Einschlafen — mit Bildern und Stimme", fr: "À écouter avant de dormir — avec images et voix", ru: "Для прослушивания перед сном — с картинками и голосом" },
  doorStoryCta: { bg: "Създай →", en: "Create →", de: "Erstellen →", fr: "Créer →", ru: "Создать →" },
  doorComicTitle: { bg: "Комикс студио", en: "Comic Studio", de: "Comic-Studio", fr: "Studio BD", ru: "Комикс-студия" },
  doorComicDesc: { bg: "Цели комикс страници с реплики и екшън", en: "Full comic pages with dialogue and action", de: "Ganze Comicseiten mit Dialogen und Action", fr: "Des pages de BD complètes avec dialogues et action", ru: "Целые страницы комиксов с репликами и экшеном" },
  doorComicCta: { bg: "Нарисувай →", en: "Draw →", de: "Zeichnen →", fr: "Dessiner →", ru: "Нарисовать →" },
  doorStoryCtaFull: { bg: "Създай приказка", en: "Create a story", de: "Geschichte erstellen", fr: "Créer une histoire", ru: "Создать сказку" },
  doorComicCtaFull: { bg: "Нарисувай комикс", en: "Draw a comic", de: "Comic zeichnen", fr: "Dessiner une BD", ru: "Нарисовать комикс" },
  micro1: { bg: "Безплатно", en: "Free", de: "Kostenlos", fr: "Gratuit", ru: "Бесплатно" },
  micro2: { bg: "Готово за около минута", en: "Ready in about a minute", de: "Fertig in etwa einer Minute", fr: "Prêt en une minute environ", ru: "Готово примерно за минуту" },
  micro3: { bg: "Запазена завинаги", en: "Saved forever", de: "Für immer gespeichert", fr: "Gardée pour toujours", ru: "Сохранится навсегда" },
  rating: { bg: "от 380+ родители", en: "from 380+ parents", de: "von 380+ Eltern", fr: "par plus de 380 parents", ru: "от 380+ родителей" },

  // ---- Create flow ----
  s1eyebrow: { bg: "Стъпка 1 · Героят", en: "Step 1 · The Hero", de: "Schritt 1 · Der Held", fr: "Étape 1 · Le héros", ru: "Шаг 1 · Герой" },
  s1q: { bg: "Как се казва детето?", en: "What is your child's name?", de: "Wie heißt dein Kind?", fr: "Comment s'appelle ton enfant ?", ru: "Как зовут ребёнка?" },
  s1help: { bg: "Това име ще се появява в цялата история — детето е истинският герой.", en: "This name will appear throughout the story — your child is the real hero.", de: "Dieser Name erscheint in der ganzen Geschichte — dein Kind ist der wahre Held.", fr: "Ce prénom apparaîtra dans toute l'histoire — ton enfant est le vrai héros.", ru: "Это имя будет во всей истории — ребёнок и есть настоящий герой." },
  namePlaceholder: { bg: "напр. Мария", en: "e.g. Emma", de: "z. B. Emma", fr: "ex. Emma", ru: "напр. Мария" },
  langQ: { bg: "На кой език да е историята?", en: "In which language should the story be?", de: "In welcher Sprache soll die Geschichte sein?", fr: "Dans quelle langue veux-tu l'histoire ?", ru: "На каком языке будет история?" },
  s2eyebrow: { bg: "Стъпка 2 · Възраст", en: "Step 2 · Age", de: "Schritt 2 · Alter", fr: "Étape 2 · Âge", ru: "Шаг 2 · Возраст" },
  s2q: { bg: "На колко години е?", en: "How old are they?", de: "Wie alt ist dein Kind?", fr: "Quel âge a-t-il ?", ru: "Сколько лет ребёнку?" },
  s2qN: { bg: "На колко години е {n}?", en: "How old is {n}?", de: "Wie alt ist {n}?", fr: "Quel âge a {n} ?", ru: "Сколько лет {n}?" },
  s2help: { bg: "Нагласяме дължината и думите според възрастта.", en: "We adjust length and vocabulary to the age.", de: "Wir passen Länge und Wortwahl dem Alter an.", fr: "Nous adaptons la longueur et les mots à l'âge.", ru: "Мы подбираем длину и слова по возрасту." },
  ageSurprise: { bg: "Изненадай ме", en: "Surprise me", de: "Überrasch mich", fr: "Surprends-moi", ru: "Удиви меня" },
  yrs: { bg: "г.", en: "yrs", de: "J.", fr: "ans", ru: "лет" },
  s3eyebrow: { bg: "Стъпка 3 · Светът", en: "Step 3 · The World", de: "Schritt 3 · Die Welt", fr: "Étape 3 · L'univers", ru: "Шаг 3 · Мир" },
  s3q: { bg: "Изберете свят", en: "Choose a world", de: "Wähle eine Welt", fr: "Choisis un univers", ru: "Выбери мир" },
  s3help: { bg: "В кой вълшебен свят да се случи историята?", en: "In which magical world should the story happen?", de: "In welcher magischen Welt soll die Geschichte spielen?", fr: "Dans quel monde magique se passe l'histoire ?", ru: "В каком волшебном мире будет история?" },
  continueBtn: { bg: "Продължи", en: "Continue", de: "Weiter", fr: "Continuer", ru: "Продолжить" },
  ctaStory: { bg: "Напиши приказката на", en: "Write the story of", de: "Schreibe die Geschichte von", fr: "Écris l'histoire de", ru: "Напиши сказку про" },
  ctaComic: { bg: "Нарисувай комикса на", en: "Draw the comic of", de: "Zeichne den Comic von", fr: "Dessine la BD de", ru: "Нарисуй комикс про" },
  heroFallback: { bg: "героя", en: "the hero", de: "dem Helden", fr: "le héros", ru: "героя" },
  newWorld: { bg: "Изненадай ме", en: "Surprise me", de: "Überrasch mich", fr: "Surprends-moi", ru: "Удиви меня" },
  newWorldDesc: { bg: "Свят-изненада, избран специално за теб", en: "A surprise world, picked just for you", de: "Eine Überraschungswelt, nur für dich", fr: "Un univers surprise, choisi pour toi", ru: "Мир-сюрприз, выбранный для тебя" },
  nameNotAllowed: { bg: "Това име не е подходящо — въведи истинското име на детето", en: "That name isn't appropriate — please enter the child's real name", de: "Dieser Name ist nicht geeignet — bitte gib den echten Namen des Kindes ein", fr: "Ce nom ne convient pas — entre le vrai prénom de l'enfant", ru: "Это имя не подходит — введи настоящее имя ребёнка" },
  errGeneric: { bg: "Нещо се обърка. Опитай отново.", en: "Something went wrong. Try again.", de: "Etwas ist schiefgelaufen. Versuch es nochmal.", fr: "Un problème est survenu. Réessaie.", ru: "Что-то пошло не так. Попробуй ещё раз." },
  errStory: { bg: "Приказката не се получи този път. Хайде пак — обикновено става от втория опит.", en: "The story didn't come through this time. Let's try again — it usually works on the second go.", de: "Die Geschichte hat diesmal nicht geklappt. Versuchen wir es nochmal — meist klappt es beim zweiten Mal.", fr: "L'histoire n'a pas abouti cette fois. Réessayons — ça marche souvent au second essai.", ru: "Сказка в этот раз не получилась. Давай ещё раз — обычно выходит со второго." },
  errComic: { bg: "Комиксът не се нарисува докрай. Пробвай пак — рисуването понякога отнема повече време.", en: "The comic didn't finish drawing. Try again — drawing sometimes takes a bit longer.", de: "Der Comic wurde nicht fertig gezeichnet. Versuch es nochmal — das Zeichnen dauert manchmal länger.", fr: "La BD n'a pas fini de se dessiner. Réessaie — le dessin prend parfois plus de temps.", ru: "Комикс не дорисовался. Попробуй ещё раз — рисование иногда занимает больше времени." },
  retryBtn: { bg: "Опитай пак", en: "Try again", de: "Nochmal versuchen", fr: "Réessayer", ru: "Попробовать снова" },
  demoTitle: { bg: "Хареса ли ти?", en: "Enjoyed it?", de: "Hat's gefallen?", fr: "Ça t'a plu ?", ru: "Понравилось?" },
  demoBody: { bg: "Това беше безплатната мостра. За неограничени приказки и комикси вземи пълното приложение.", en: "That was the free taster. For unlimited stories and comics, get the full app.", de: "Das war die kostenlose Kostprobe. Für unbegrenzte Geschichten und Comics hol dir die volle App.", fr: "C'était l'aperçu gratuit. Pour des histoires et BD illimitées, prends l'application complète.", ru: "Это была бесплатная проба. Для безлимитных сказок и комиксов возьми полное приложение." },
  demoGetApp: { bg: "📲 Вземи приложението", en: "📲 Get the app", de: "📲 App holen", fr: "📲 Obtenir l'app", ru: "📲 Получить приложение" },
  demoBack: { bg: "Обратно", en: "Back", de: "Zurück", fr: "Retour", ru: "Назад" },
  demoSoon: { bg: "Скоро в App Store и Google Play", en: "Coming soon to the App Store and Google Play", de: "Bald im App Store und bei Google Play", fr: "Bientôt sur l'App Store et Google Play", ru: "Скоро в App Store и Google Play" },
  demoUnlockWeb: { bg: "Отключи пълен достъп", en: "Unlock full access", de: "Vollzugang freischalten", fr: "Débloquer l'accès complet", ru: "Открыть полный доступ" },
  demoUnlockNote: { bg: "Еднократно плащане · важи на всички твои устройства", en: "One-time payment · works on all your devices", de: "Einmalige Zahlung · gilt auf allen deinen Geräten", fr: "Paiement unique · valable sur tous tes appareils", ru: "Разовый платёж · работает на всех твоих устройствах" },
  payUnavailable: { bg: "Плащането не е достъпно в момента. Опитай пак след малко.", en: "Payment is unavailable right now. Please try again shortly.", de: "Zahlung derzeit nicht verfügbar. Versuch es gleich nochmal.", fr: "Paiement indisponible pour le moment. Réessaie bientôt.", ru: "Оплата сейчас недоступна. Попробуй чуть позже." },
  privacy: { bg: "Политика за поверителност", en: "Privacy Policy", de: "Datenschutz", fr: "Confidentialité", ru: "Политика конфиденциальности" },
  shareBtn: { bg: "Сподели", en: "Share", de: "Teilen", fr: "Partager", ru: "Поделиться" },
  shareText: { bg: "Направи на детето си приказка, в която то е героят — с илюстрации и глас. Пробвай AuraKids!", en: "Make your child a story where they're the hero — with pictures and voice. Try AuraKids!", de: "Mach deinem Kind eine Geschichte, in der es der Held ist — mit Bildern und Stimme. Probier AuraKids!", fr: "Crée à ton enfant une histoire où il est le héros — avec images et voix. Essaie AuraKids !", ru: "Создай ребёнку сказку, где он герой — с картинками и голосом. Попробуй AuraKids!" },

  // ---- Loading ----
  loadStory: { bg: "Приказката се ражда…", en: "The story is being born…", de: "Die Geschichte entsteht…", fr: "L'histoire prend vie…", ru: "Сказка рождается…" },
  loadComic: { bg: "Комиксът се рисува…", en: "The comic is being drawn…", de: "Der Comic wird gezeichnet…", fr: "La BD se dessine…", ru: "Комикс рисуется…" },
  loadSub: { bg: "Никое друго дете не е получавало точно тази история.", en: "No other child has ever received this exact story.", de: "Kein anderes Kind hat je genau diese Geschichte bekommen.", fr: "Aucun autre enfant n'a jamais reçu cette histoire.", ru: "Ни один другой ребёнок не получал именно эту историю." },
  ls1: { bg: "Измисляме героя", en: "Creating the hero", de: "Wir erfinden den Helden", fr: "Création du héros", ru: "Придумываем героя" },
  ls2: { bg: "Пишем историята", en: "Writing the story", de: "Wir schreiben die Geschichte", fr: "Écriture de l'histoire", ru: "Пишем историю" },
  ls3: { bg: "Рисуваме илюстрациите", en: "Painting the pictures", de: "Wir malen die Bilder", fr: "Peinture des illustrations", ru: "Рисуем иллюстрации" },
  ls4: { bg: "Записваме гласа", en: "Recording the voice", de: "Wir nehmen die Stimme auf", fr: "Enregistrement de la voix", ru: "Записываем голос" },

  // ---- Reader ----
  storyFor: { bg: "Приказка за", en: "A story for", de: "Eine Geschichte für", fr: "Une histoire pour", ru: "Сказка для" },
  midCaption: { bg: "в сърцето на приключението", en: "at the heart of the adventure", de: "mitten im Abenteuer", fr: "au cœur de l'aventure", ru: "в сердце приключения" },
  endCaption: { bg: "Щастливият край", en: "The happy ending", de: "Das Happy End", fr: "La fin heureuse", ru: "Счастливый конец" },
  theEnd: { bg: "Край на приказката", en: "The End", de: "Ende der Geschichte", fr: "Fin de l'histoire", ru: "Конец сказки" },
  endText: { bg: "Сладки сънища, малки герою. Тази история бе създадена само за", en: "Sweet dreams, little hero. This story was created just for", de: "Süße Träume, kleiner Held. Diese Geschichte wurde nur erschaffen für", fr: "Fais de beaux rêves, petit héros. Cette histoire a été créée rien que pour", ru: "Сладких снов, маленький герой. Эта история создана только для" },
  newStoryBtn: { bg: "Създай нова приказка", en: "Create a new story", de: "Neue Geschichte erstellen", fr: "Créer une nouvelle histoire", ru: "Создать новую сказку" },
  readBy: { bg: "Чете", en: "Read by", de: "Gelesen von", fr: "Lu par", ru: "Читает" },
  tapToListen: { bg: "Натисни, за да чуеш историята", en: "Tap to hear the story", de: "Tippe, um die Geschichte zu hören", fr: "Appuie pour écouter l'histoire", ru: "Нажми, чтобы услышать историю" },
  playing: { bg: "Възпроизвежда…", en: "Playing…", de: "Wird abgespielt…", fr: "Lecture…", ru: "Воспроизводится…" },
  voiceLabel: { bg: "Глас", en: "Voice", de: "Stimme", fr: "Voix", ru: "Голос" },

  // ---- Comic ----
  comicFor: { bg: "Комикс за", en: "A comic for", de: "Ein Comic für", fr: "Une BD pour", ru: "Комикс для" },
  comicEnd: { bg: "Край!", en: "The End!", de: "Ende!", fr: "Fin !", ru: "Конец!" },
  comicEndText: { bg: "Този комикс бе нарисуван само за", en: "This comic was drawn just for", de: "Dieser Comic wurde nur gezeichnet für", fr: "Cette BD a été dessinée rien que pour", ru: "Этот комикс нарисован только для" },
  newComicBtn: { bg: "Нов комикс", en: "New comic", de: "Neuer Comic", fr: "Nouvelle BD", ru: "Новый комикс" },

  // ---- Comic styles ----
  styleQ: { bg: "Стил на рисуване", en: "Art style", de: "Zeichenstil", fr: "Style de dessin", ru: "Стиль рисунка" },
  styleHelp: { bg: "Как да изглеждат картинките на комикса?", en: "How should the comic art look?", de: "Wie sollen die Comic-Bilder aussehen?", fr: "À quoi doit ressembler la BD ?", ru: "Как должны выглядеть картинки комикса?" },
  tabWorld: { bg: "Свят", en: "World", de: "Welt", fr: "Univers", ru: "Мир" },
  tabStyle: { bg: "Стил", en: "Style", de: "Stil", fr: "Style", ru: "Стиль" },
  stPixar: { bg: "3D филм", en: "3D movie", de: "3D-Film", fr: "Film 3D", ru: "3D-фильм" },
  stPixarD: { bg: "Като Pixar анимация", en: "Like a Pixar film", de: "Wie ein Pixar-Film", fr: "Comme un film Pixar", ru: "Как мультфильм Pixar" },
  stCartoon: { bg: "Карикатурен", en: "Cartoon", de: "Cartoon", fr: "Cartoon", ru: "Мультяшный" },
  stCartoonD: { bg: "Смешен, като Астерикс", en: "Funny, like Asterix", de: "Lustig, wie Asterix", fr: "Drôle, comme Astérix", ru: "Смешной, как Астерикс" },
  stManga: { bg: "Манга", en: "Manga", de: "Manga", fr: "Manga", ru: "Манга" },
  stMangaD: { bg: "Големи очи, екшън", en: "Big eyes, action", de: "Große Augen, Action", fr: "Grands yeux, action", ru: "Большие глаза, экшен" },
  stRetro: { bg: "Класически комикс", en: "Classic comic", de: "Klassischer Comic", fr: "BD classique", ru: "Классический комикс" },
  stRetroD: { bg: "Ретро, ярки контури", en: "Retro, bold ink", de: "Retro, kräftige Linien", fr: "Rétro, encre marquée", ru: "Ретро, яркие контуры" },

  // ---- Loading tips (rotate while generating) ----
  ltip1: { bg: "Звездите шепнат името на героя…", en: "The stars are whispering the hero's name…", de: "Die Sterne flüstern den Namen des Helden…", fr: "Les étoiles chuchotent le nom du héros…", ru: "Звёзды шепчут имя героя…" },
  ltip2: { bg: "Луната си наглася възглавницата, за да слуша…", en: "The moon is fluffing its pillow to listen…", de: "Der Mond richtet sein Kissen zum Zuhören…", fr: "La lune arrange son oreiller pour écouter…", ru: "Луна взбивает подушку, чтобы послушать…" },
  ltip3: { bg: "Четка от лунни лъчи рисува небето…", en: "A brush of moonbeams is painting the sky…", de: "Ein Pinsel aus Mondstrahlen malt den Himmel…", fr: "Un pinceau de rayons de lune peint le ciel…", ru: "Кисть из лунных лучей рисует небо…" },
  ltip4: { bg: "Разказвачът си прочиства гърлото… кхъм-кхъм.", en: "The narrator is clearing their throat… ahem.", de: "Der Erzähler räuspert sich… ähem.", fr: "Le conteur s'éclaircit la voix… hum hum.", ru: "Рассказчик прочищает горло… кхм-кхм." },
  lctip1: { bg: "Героят пробва пелерината си…", en: "The hero is trying on their cape…", de: "Der Held probiert seinen Umhang an…", fr: "Le héros essaie sa cape…", ru: "Герой примеряет плащ…" },
  lctip2: { bg: "БУМ! ФИУУ! Звуковите ефекти се загряват…", en: "BOOM! WHOOSH! The sound effects are warming up…", de: "BUMM! WUSCH! Die Soundeffekte wärmen sich auf…", fr: "BOUM ! WOUSH ! Les onomatopées s'échauffent…", ru: "БУМ! ВЖУХ! Звуковые эффекты разминаются…" },
  lctip3: { bg: "Мастилото на страница 3 още съхне…", en: "The ink on page 3 is still drying…", de: "Die Tinte auf Seite 3 trocknet noch…", fr: "L'encre de la page 3 sèche encore…", ru: "Чернила на странице 3 ещё сохнут…" },
  lctip4: { bg: "Спътникът пак направи беля… разчистваме.", en: "The sidekick made a mess again… cleaning up.", de: "Der Gefährte hat wieder Unsinn gemacht… wir räumen auf.", fr: "L'acolyte a encore fait une bêtise… on nettoie.", ru: "Напарник снова натворил дел… убираем." },

  // ---- Comic generating checklist ----
  cls1: { bg: "Историята се пише", en: "Writing the story", de: "Die Geschichte wird geschrieben", fr: "L'histoire s'écrit", ru: "История пишется" },
  cls2: { bg: "Героят се рисува", en: "Drawing the hero", de: "Der Held wird gezeichnet", fr: "Le héros se dessine", ru: "Герой рисуется" },
  cls3: { bg: "Страниците се подреждат", en: "Laying out the pages", de: "Die Seiten werden angeordnet", fr: "Les pages se mettent en place", ru: "Страницы выстраиваются" },
  cls4: { bg: "Балончетата се пълнят с реплики", en: "Filling the speech bubbles", de: "Die Sprechblasen werden gefüllt", fr: "Les bulles se remplissent", ru: "Пузыри наполняются репликами" },

  // ---- Library ----
  libTitle: { bg: "Моята библиотека", en: "My library", de: "Meine Bibliothek", fr: "Ma bibliothèque", ru: "Моя библиотека" },
  libSub: { bg: "запазени завинаги", en: "saved forever", de: "für immer gespeichert", fr: "gardées pour toujours", ru: "сохранены навсегда" },
  libCount: { bg: "истории", en: "stories", de: "Geschichten", fr: "histoires", ru: "историй" },
  libAll: { bg: "Всички", en: "All", de: "Alle", fr: "Toutes", ru: "Все" },
  libComics: { bg: "Комикси", en: "Comics", de: "Comics", fr: "BD", ru: "Комиксы" },
  libStories: { bg: "Приказки", en: "Stories", de: "Geschichten", fr: "Histoires", ru: "Сказки" },
  libNewBtn: { bg: "Нова история", en: "New story", de: "Neue Geschichte", fr: "Nouvelle histoire", ru: "Новая история" },
  libEmpty: { bg: "Още няма запазени истории. Създай първата!", en: "No saved stories yet. Create the first one!", de: "Noch keine gespeicherten Geschichten. Erstelle die erste!", fr: "Pas encore d'histoires enregistrées. Crée la première !", ru: "Пока нет сохранённых историй. Создай первую!" },
  libBadgeComic: { bg: "Комикс", en: "Comic", de: "Comic", fr: "BD", ru: "Комикс" },
  libBadgeStory: { bg: "Приказка", en: "Story", de: "Geschichte", fr: "Histoire", ru: "Сказка" },
  libFor: { bg: "за", en: "for", de: "für", fr: "pour", ru: "для" },
  libCode: { bg: "Семеен код", en: "Family code", de: "Familiencode", fr: "Code famille", ru: "Семейный код" },
  libCopyCode: { bg: "Копирай кода", en: "Copy code", de: "Code kopieren", fr: "Copier le code", ru: "Копировать код" },
  libCodeHint: { bg: "Запази този код — с него виждаш историите си на всяко устройство.", en: "Keep this code — use it to see your stories on any device.", de: "Bewahre diesen Code auf — damit siehst du deine Geschichten auf jedem Gerät.", fr: "Garde ce code — il te permet de voir tes histoires sur tout appareil.", ru: "Сохрани этот код — с ним ты увидишь свои истории на любом устройстве." },
  libRestore: { bg: "Друго устройство", en: "Other device", de: "Anderes Gerät", fr: "Autre appareil", ru: "Другое устройство" },
  libLoad: { bg: "Зареди", en: "Load", de: "Laden", fr: "Charger", ru: "Загрузить" },

  // ---- Themes ----
  thDragon: { bg: "Дракони", en: "Dragons", de: "Drachen", fr: "Dragons", ru: "Драконы" },
  thDragonD: { bg: "Смели полети и съкровища", en: "Brave flights and treasure", de: "Mutige Flüge und Schätze", fr: "Vols audacieux et trésors", ru: "Смелые полёты и сокровища" },
  thSpace: { bg: "Космос", en: "Space", de: "Weltall", fr: "Espace", ru: "Космос" },
  thSpaceD: { bg: "Звезди и далечни планети", en: "Stars and distant planets", de: "Sterne und ferne Planeten", fr: "Étoiles et planètes lointaines", ru: "Звёзды и далёкие планеты" },
  thForest: { bg: "Омагьосана гора", en: "Enchanted forest", de: "Zauberwald", fr: "Forêt enchantée", ru: "Заколдованный лес" },
  thForestD: { bg: "Приятели сред дърветата", en: "Friends among the trees", de: "Freunde zwischen den Bäumen", fr: "Des amis parmi les arbres", ru: "Друзья среди деревьев" },
  thMermaid: { bg: "Морско царство", en: "Ocean kingdom", de: "Meereskönigreich", fr: "Royaume marin", ru: "Морское царство" },
  thMermaidD: { bg: "Дълбини и русалки", en: "Depths and mermaids", de: "Tiefen und Meerjungfrauen", fr: "Profondeurs et sirènes", ru: "Глубины и русалки" },
  thSuper: { bg: "Супергерои", en: "Superheroes", de: "Superhelden", fr: "Super-héros", ru: "Супергерои" },
  thSuperD: { bg: "Сила да спасиш деня", en: "Power to save the day", de: "Kraft, den Tag zu retten", fr: "Le pouvoir de sauver le monde", ru: "Сила спасти день" },
  thFairy: { bg: "Феи", en: "Fairies", de: "Feen", fr: "Fées", ru: "Феи" },
  thFairyD: { bg: "Блясък и вълшебен прах", en: "Sparkle and magic dust", de: "Glitzer und Feenstaub", fr: "Paillettes et poudre magique", ru: "Блеск и волшебная пыль" },
};

export function t(lang: string, key: string): string {
  const entry = D[key];
  if (!entry) return key;
  return entry[(lang as Lang)] ?? entry.bg;
}
