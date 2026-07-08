/* -------------------------------------------------------------
 * にほんちずクイズ - Application Logic
 * Interactive Learning & Quiz system using Web Audio & Speech API
 * ------------------------------------------------------------- */

// Dynamic Injection of CSS rule to toggle Rubies (Furigana) smoothly
const rubyStyle = document.createElement('style');
rubyStyle.innerHTML = "body.ruby-off rt { display: none !important; }";
document.head.appendChild(rubyStyle);

// Preload mascot images to prevent flickering on emotion changes
const mascotImages = [
  'images/mascot_happy.png',
  'images/mascot_sad.png',
  'images/mascot_success.png'
];
mascotImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

// 47 Japanese Prefectures Complete Database for Children
const PREFECTURES = {
  "1": { name: "北海道", kana: "ほっかいどう", capital: "札幌", capitalKana: "さっぽろ", region: "hokkaido-tohoku", info: "日本（にほん）で いちばん 広い（ひろい）ところだよ。おいしい じゃがいもや メロン、ソフトクリーム、カニや サケがたくさん とれるよ！" },
  "2": { name: "青森県", kana: "あおもりけん", capital: "青森", capitalKana: "あおもり", region: "hokkaido-tohoku", info: "りんごの しゅうかく量が 日本一（にほんいち）！夏（なつ）の 大きな（おおきな）「ねぶたまつり」には、たくさんの 人（ひと）が あつまるよ。" },
  "3": { name: "岩手県", kana: "いわてけん", capital: "盛岡", capitalKana: "もりおか", region: "hokkaido-tohoku", info: "２番目（にばんめ）に 広い（ひろい）県（けん）だよ。「わんこそば」という、おわんに おそばを つぎつぎに いれて 食べる（たべる）名物（めいぶつ）があるよ。" },
  "4": { name: "宮城県", kana: "みやぎけん", capital: "仙台", capitalKana: "せんだい", region: "hokkaido-tohoku", info: "「ずんだもち」や「牛タン（ぎゅうたん）」が おいしいよ。むかしの 武士（ぶし）「伊達政宗（だてまさむね）」が つくった 仙台の まちが 有名（ゆうめい）だよ。" },
  "5": { name: "秋田県", kana: "あきたけん", capital: "秋田", capitalKana: "あきた", region: "hokkaido-tohoku", info: "おいしい お米（おこめ）「あきたこまち」が とれるよ。もふもふして 可愛い（かわいい）「秋田犬（あきたけん）」や、お面（おめん）をかぶった「なまはげ」が 有名（ゆうめい）だよ。" },
  "6": { name: "山形県", kana: "やまがたけん", capital: "山形", capitalKana: "やまがた", region: "hokkaido-tohoku", info: "くだものの「さくらんぼ」の しゅうかく量が 日本一（にほんいち）！将棋（しょうぎ）の コマを いっぱい つくっている まちもあるよ。" },
  "7": { name: "福島県", kana: "ふくしまけん", capital: "福島", capitalKana: "ふくしま", region: "hokkaido-tohoku", info: "あまくて ジューシーな「モモ」や「ナシ」がたくさん とれるよ。木（き）で つくられた 赤い（あかい）ウシのおもちゃ「赤べこ（あかべこ）」が 有名（ゆうめい）だよ。" },
  "8": { name: "茨城県", kana: "いばらきけん", capital: "水戸", capitalKana: "みと", region: "kanto", info: "ねばねばして おいしい「納豆（なっとう）」や、あまい「メロン」が 有名（ゆうめい）！宇宙（うちゅう）について 研究（けんきゅう）する 科学（かがく）の まちがあるよ。" },
  "9": { name: "栃木県", kana: "とちぎけん", capital: "宇都宮", capitalKana: "うつのみや", region: "kanto", info: "「いちご」の しゅうかく量が ずーっと 日本一（にほんいち）！「宇都宮の ギョーザ」や、世界遺産（せかいいさん）の「日光東照宮（にっこうとうしょうぐう）」が 有名（ゆうめい）だよ。" },
  "10": { name: "群馬県", kana: "ぐんまけん", capital: "前橋", capitalKana: "まえばし", region: "kanto", info: "お鍋（おなべ）にいれると おいしい「こんにゃく」や「ネギ」がたくさん とれるよ。もくもくと 湯（ゆ）があがる「草津温泉（くさつおんせん）」が 有名（ゆうめい）だよ。" },
  "11": { name: "埼玉県", kana: "さいたまけん", capital: "さいたま", capitalKana: "さいたま", region: "kanto", info: "ねぎ や ブロッコリーなどの 野菜（やさい）を たくさん つくっているよ。可愛い（かわいい）駄菓子（だがし）の まちや、鉄道（てつどう）の 博物館（はくぶつかん）があるよ。" },
  "12": { name: "千葉県", kana: "ちばけん", capital: "千葉", capitalKana: "ちば", region: "kanto", info: "土（つち）の なかで そだつ「落花生（らっかせい・ピーナッツ）」がたくさん とれるよ。大きな（おおきな）飛行場（ひこうじょう・成田空港）や、有名な テーマパークがあるよ！" },
  "13": { name: "東京都", kana: "とうきょうと", capital: "新宿", capitalKana: "しんじゅく", region: "kanto", info: "日本（にほん）の 首都（しゅと・政治や経済のちゅうしん）だよ。たくさんの 人（ひと）が くらしていて、スカイツリーや 東京タワーなどの 高い（たかい）ビルがいっぱい！" },
  "14": { name: "神奈川県", kana: "かながわけん", capital: "横浜", capitalKana: "よこはま", region: "kanto", info: "大きな（おおきな）船（ふね）が くる 横浜みなとみらい が有名！むかしの 政府（せいふ）があった「鎌倉（かまくら）」には、大きな 大仏さま（だいぶつさま）がいるよ。" },
  "15": { name: "新潟県", kana: "にいがたけん", capital: "新潟", capitalKana: "にいがた", region: "chubu", info: "おいしい お米（おこめ）「コシヒカリ」や、おせんべい が 有名！冬（ふゆ）には たくさんの 雪（ゆき）が ふるので、スキー場（じょう）がたくさん あるよ。" },
  "16": { name: "富山県", kana: "とやまけん", capital: "富山", capitalKana: "富山", region: "chubu", info: "まわりを 高い（たかい）山（やま）にかこまれていて、きれいで 冷たい（つめたい）水（みず）が ながれているよ。「ホタルイカ」や、くすりの まちとして 有名（ゆうめい）だよ。" },
  "17": { name: "石川県", kana: "いしかわけん", capital: "金沢", capitalKana: "かなざわ", region: "chubu", info: "きらきら 光る（ひかる）「金箔（きんぱく）」を たくさん つくっているよ。むかしながらの 美しい（うつくしい）お家（おうち）や お寺（おてら）が のこる 金沢のまち が有名だよ。" },
  "18": { name: "福井県", kana: "ふくいけん", capital: "福井", capitalKana: "ふくい", region: "chubu", info: "たくさんの「恐竜（きょうりゅう）の ほね」が みつかった、きょうりゅう王国（おうこく）！きれいな 海（うみ）で とれる「越前ガニ（えちぜんがに）」や メガネのフレーム作りが 有名だよ。" },
  "19": { name: "山梨県", kana: "やまなしけん", capital: "甲府", capitalKana: "こうふ", region: "chubu", info: "日本一（にほんいち）高い（たかい）「富士山（ふじさん）」の 北側（きたがわ）にあるよ。あまくて おいしい「ぶどう」や「もも」の しゅうかく量が 日本一（にほんいち）！" },
  "20": { name: "長野県", kana: "ながのけん", capital: "長野", capitalKana: "ながの", region: "chubu", info: "まわりを 高い（たかい）山（やま）にかこまれた、自然（しぜん）がいっぱいの 県（けん）だよ。あかい「りんご」や、つるつると おいしい「信州そば」が 有名（ゆうめい）だよ。" },
  "21": { name: "岐阜県", kana: "ぎふけん", capital: "岐阜", capitalKana: "ぎふ", region: "chubu", info: "おやねが 三角（さんかく）の形（かたち）をした むかしの お家（おうち）「白川郷（しらかわごう）」があるよ。きれいな 川（かわ）で さかなをとる「鵜飼（うかい）」も 有名！" },
  "22": { name: "静岡県", kana: "しずおかけん", capital: "静岡", capitalKana: "しずおか", region: "chubu", info: "お茶（おちゃ）の はっぱの しゅうかく量が 日本一（にほんいち）！日本一（にほんいち）高い 山の「富士山（ふじさん）」や、おいしい「うなぎ」が 有名（ゆうめい）だよ。" },
  "23": { name: "愛知県", kana: "あいちけん", capital: "名古屋", capitalKana: "なごや", region: "chubu", info: "くるま（自動車）を たくさん つくって 世界中（せかいじゅう）に おくっているよ。名古屋の「手羽先（てばさき）」や「みそかつ」など、おいしい 食べものが いっぱい！" },
  "24": { name: "三重県", kana: "みえけん", capital: "津", capitalKana: "つ", region: "kinki", info: "むかしから 神さま（かみさま）の 場所（ばしょ）として 大事（だいじ）にされてきた「伊勢神宮（いせじんぐう）」があるよ。海（うみ）に もぐって 貝（かい）をとる「海女（あま）さん」が有名！" },
  "25": { name: "滋賀県", kana: "しがけん", capital: "大津", capitalKana: "おおつ", region: "kinki", info: "日本（にほん）で いちばん 大きな（おおきな）みずうみ「琵琶湖（びわこ）」が 県（けん）の まんなかにあるよ！たぬきの 焼きもの（信楽焼・しがらきやき）が有名だよ。" },
  "26": { name: "京都府", kana: "きょうとふ", capital: "京都", capitalKana: "きょうと", region: "kinki", info: "1000年以上（せんねんいじょう）むかし、日本の 中心（ちゅうしん）だった まちだよ。金閣寺（きんかくじ）など、古い（ふるい）お寺や 神社（じんじゃ）が たくさん のこっているよ。" },
  "27": { name: "大阪府", kana: "おおさかふ", capital: "大阪", capitalKana: "おおさか", region: "kinki", info: "「たこ焼き（たこやき）」や「お好み焼き（おこのみやき）」などの 粉もん（こなもん）文化！おもしろい お笑い（おわらい）や、大きなお城の「大阪城」が有名！" },
  "28": { name: "兵庫県", kana: "ひょうごけん", capital: "神戸", capitalKana: "こうべ", region: "kinki", info: "北（きた）の海と 南（みなみ）の海、両方（りょうほう）に 面して（めんして）いるよ。真っ白で 美しい（うつくしい）「姫路城（ひめじじょう）」や、オシャレな神戸みなとまちが 有名だよ。" },
  "29": { name: "奈良県", kana: "ならけん", capital: "奈良", capitalKana: "なら", region: "kinki", info: "京都（きょうと）より さらに むかしに 日本の 中心（ちゅうしん）だった まちだよ。東大寺（とうだいじ）には とても 大きな「大仏さま（だいぶつさま）」がいて、公園には シカがいっぱい！" },
  "30": { name: "和歌山県", kana: "わかやまけん", capital: "和歌山", capitalKana: "わかやま", region: "kinki", info: "あまくて 美味しい（おいしい）「みかん」や「うめぼし」がたくさん とれるよ。パンダがたくさん くらしている 動物園（どうぶつえん・アドベンチャーワールド）があるよ！" },
  "31": { name: "鳥取県", kana: "とっとりけん", capital: "鳥取", capitalKana: "とっとり", region: "chugoku-shikoku", info: "風（かぜ）が つくった 砂（すな）の おか「鳥取砂丘（とっとりさきゅう）」が 有名だよ。あまくて シャキシャキした「二十世紀梨（にじっせいきなし）」がたくさん とれるよ。" },
  "32": { name: "島根県", kana: "しまねけん", capital: "松江", capitalKana: "まつえ", region: "chugoku-shikoku", info: "日本中（にほんじゅう）の 神さま（かみさま）が あつまる「出雲大社（いづもたいしゃ）」があるよ。きれいな 湖（しんじこ）で とれる「シジミ」という カイが有名！" },
  "33": { name: "岡山県", kana: "おかやまけん", capital: "岡山", capitalKana: "おかやま", region: "chugoku-shikoku", info: "むかしばなし「桃太郎（ももたろう）」の おうちがあったと 言われて（いわれて）いるよ。あまい「マスカット（ぶどう）」や「白桃（はくとう・モモ）」が有名！" },
  "34": { name: "広島県", kana: "ひろしまけん", capital: "広島", capitalKana: "ひろしま", region: "chugoku-shikoku", info: "海（うみ）のなかに 鳥居（とりい）が たっている「宮島（みやじま・厳島神社）」があるよ。すっぱい「レモン」や、海の「カキ」、お好み焼きが 有名（ゆうめい）だよ。" },
  "35": { name: "山口県", kana: "やまぐちけん", capital: "山口", capitalKana: "やまぐち", region: "chugoku-shikoku", info: "日本の 本州（ほんしゅう）の いちばん 西（にし）にあるよ。おなかが ぷっくり膨らむ（ふくらむ）高級（こうきゅう）な お魚（さかな）の「フグ」が 有名（ゆうめい）だよ。" },
  "36": { name: "徳島県", kana: "とくしまけん", capital: "徳島", capitalKana: "とくしま", region: "chugoku-shikoku", info: "夏（なつ）におこなわれる「阿波おどり（あわおどり）」という ダンスのお祭りが有名だよ！すっぱい くだもの「すだち」や、あまい「さつまいも」がとれるよ。" },
  "37": { name: "香川県", kana: "かがわけん", capital: "高松", capitalKana: "たかまつ", region: "chugoku-shikoku", info: "日本（にほん）で いちばん 面積（めんせき）が ちいさい県だよ。コシが つよくて 美味しい（おいしい）「讃岐うどん（さぬきうどん）」が 有名で、うどん県とも呼ばれるよ！" },
  "38": { name: "愛媛県", kana: "えひめけん", capital: "松山", capitalKana: "まつやま", region: "chugoku-shikoku", info: "あまくて ジューシーな「みかん」がたくさん とれるよ！日本（にほん）で いちばん 古い（ふるい）と言われる（いわれる）温泉「道後温泉（どうごおんせん）」があるよ。" },
  "39": { name: "高知県", kana: "こうちけん", capital: "高知", capitalKana: "こうち", region: "chugoku-shikoku", info: "海（うみ）の 魚（さかな）「カツオ」が 有名で、わらで まわりを あぶって食べる「カツオのたたき」が絶品！むかしの ヒーロー「坂本龍馬（さかもとりょうま）」の生まれたところだよ。" },
  "40": { name: "福岡県", kana: "ふくおかけん", capital: "福岡", capitalKana: "ふくおか", region: "kyushu-okinawa", info: "九州（きゅうしゅう）で いちばん 人（ひと）が 多いところだよ。つぶつぶピリ辛（から）の「明太子（めんたいこ）」や、あったかい「とんこつラーメン」が 有名！" },
  "41": { name: "佐賀県", kana: "さがけん", capital: "佐賀", capitalKana: "さが", region: "kyushu-okinawa", info: "むかしから 粘土（ねんど）でお皿（おさら）をつくってきた「有田焼（ありたやき）」などの やきもののまち！秋（あき）には 色とりどりの「気球（バルーン）」が空を舞うよ。" },
  "42": { name: "長崎県", kana: "ながさきけん", capital: "長崎", capitalKana: "ながさき", region: "kyushu-okinawa", info: "たくさんの 小さな島（しま）にかこまれているよ。あまい ケーキ「カステラ」や、むかし 外国（がいこく）から 船がやってきた「出島（でじま）」が 有名だよ。" },
  "43": { name: "熊本県", kana: "くまもとけん", capital: "熊本", capitalKana: "くまもと", region: "kyushu-okinawa", info: "大きな（おおきな）火の山（ひのやま）「阿蘇山（あそさん）」があるよ。あかい「トマト」や 大きな「スイカ」、かっこいい「熊本城（くまもとじょう）」が 有名だよ。" },
  "44": { name: "大分県", kana: "おおいたけん", capital: "大分", capitalKana: "おおいた", region: "kyushu-okinawa", info: "温泉（おんせん）の わきでる量が 日本一（にほんいち）の おんせん県！「別府（べっぷ）」や「湯布院（ゆふいん）」など、ブクブク お湯（おゆ）のわく 温泉街が有名だよ。" },
  "45": { name: "宮崎県", kana: "みやざきけん", capital: "宮崎", capitalKana: "みやざき", region: "kyushu-okinawa", info: "いちねんじゅう あたたかくて、ヤシの木が ならぶ 南の国（みなみのくに）みたい！あまくて 黄色い「マンゴー」や、おいしい「宮崎牛（みやざきぎゅう）」が有名！" },
  "46": { name: "鹿児島県", kana: "かごしまけん", capital: "鹿児島", capitalKana: "かごしま", region: "kyushu-okinawa", info: "海（うみ）のなかに モクモクと けむりをだす「桜島（さくらじま）」という 火山があるよ！あまい「さつまいも」や、黒ブタ（くろぶた）のお肉が 有名だよ。" },
  "47": { name: "沖縄県", kana: "おきなわけん", capital: "那覇", capitalKana: "なは", region: "kyushu-okinawa", info: "１年中（いちねんじゅう）あたたかくて、あおい 海（うみ）が とっても きれい！あまい「サトウキビ」や「パイナップル」、魔除け（まよけ）の「シーサー」が有名！" }
};

// Region Names mapping
const REGIONS = {
  "hokkaido-tohoku": "ほっかいどう・とうほく",
  "kanto": "かんとう",
  "chubu": "ちゅうぶ",
  "kinki": "かんさい",
  "chugoku-shikoku": "ちゅうごく・しこく",
  "kyushu-okinawa": "きゅうしゅう・おきなわ"
};

// Global App State
const state = {
  mode: 'menu',             // 'menu', 'learn', 'quiz-a', 'quiz-b'
  region: 'all',            // 'all', 'hokkaido-tohoku', ...
  selectedCode: null,       // Code of prefecture currently clicked in learn mode
  isRubyOn: true,           // Furigana ON/OFF
  isSoundOn: true,          // Synth Audio effects
  isVoiceOn: true,          // Speech Synthesis read-out
  
  // Quiz parameters
  quizQueue: [],            // List of codes to ask
  quizCurrentIndex: 0,
  quizCorrectCount: 0,
  quizCurrentTarget: null,   // Target prefecture code for current question
  quizChoices: [],          // 4 codes for Quiz B choices
  
  // Persistence lists (LocalStorage)
  learnedPrefectures: {},   // { "1": true, "24": true }
  highScores: {}            // { "quiz-a-all": 47, "quiz-b-kanto": 7 }
};

// Sound effects synthesizer using Web Audio API
const SoundSynth = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  playCorrect() {
    if (!state.isSoundOn) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Play a nice sweet arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0.15, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.35);
    });
  },
  
  playWrong() {
    if (!state.isSoundOn) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Play a buzzer sound (sawtooth, rapid pitch drop down)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.26);
  },
  
  playClear() {
    if (!state.isSoundOn) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Short triumphant fanfare
    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.25 } // C6 (long)
    ];
    
    let time = now;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);
      
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + note.d + 0.05);
      
      time += note.d * 0.8;
    });
  }
};

// Helper to ensure voices are preloaded and cached for Web Speech API
let voices = [];
function loadVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices();
  }
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

// Male Japanese voices we never want to pitch up (sounds unnatural / scary)
const MALE_VOICE_RE = /male|男性|otoya|ichiro|hattori|daichi|keita|naoki/i;

// Pick a gentle, cute-sounding female Japanese voice
function pickCuteJapaneseVoice() {
  const all = window.speechSynthesis.getVoices();
  let ja = all.filter(v => v.lang && (v.lang.includes('ja-JP') || v.lang.toLowerCase().startsWith('ja')));
  if (ja.length === 0) return null;

  // Never use an obviously male voice
  const nonMale = ja.filter(v => !MALE_VOICE_RE.test(v.name || ''));
  if (nonMale.length) ja = nonMale;

  // Best-quality, soft/cute female Japanese voices first (across OSes & browsers).
  // Natural / online / enhanced voices sound far kinder than the old robotic ones.
  const preferredNames = [
    'nanami',            // Microsoft Nanami (Edge, natural) – very soft & friendly
    'kyoko',             // macOS/iOS female
    'ayumi', 'haruka', 'sayaka', 'ichika', 'aoi', 'mayu', 'sakura',
    'mizuki',            // Amazon Polly female
    'google 日本語', 'google japanese',
    'female', '女性'
  ];
  for (const name of preferredNames) {
    // Prefer a "natural"/"online"/"enhanced" variant of the matched voice if present
    const matches = ja.filter(v => v.name && v.name.toLowerCase().includes(name));
    if (matches.length) {
      const nice = matches.find(v => /natural|online|enhanced|premium/i.test(v.name));
      return nice || matches[0];
    }
  }

  return ja[0];
}

// Text-to-speech engine using Web Speech API
const VoiceSpeech = {
  speak(text, onEnd = null) {
    if (!state.isVoiceOn) {
      // Voice is off: still fire the callback so quiz flow can proceed
      if (onEnd) onEnd();
      return;
    }

    // Prevent locking on cancel when not speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a cute Japanese voice for clear, friendly pronunciation
    const jaVoice = pickCuteJapaneseVoice();
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    // High-quality (neural / online) voices stay clear even when pitched up high,
    // so we can push them to a cute, childlike pitch. Basic/robotic voices distort
    // and sound "scary" if pitched too high, so we lift them only gently.
    const isHqVoice = jaVoice && /natural|online|enhanced|premium|google|siri/i.test(jaVoice.name || '');

    utterance.lang = 'ja-JP';
    utterance.rate = isHqVoice ? 1.0 : 0.95;  // light & lively, easy for kids to follow
    utterance.pitch = isHqVoice ? 1.55 : 1.35; // childlike & cute, without distortion

    if (onEnd) {
      // Fire on natural end OR on error so the quiz never stalls
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }
};

// Advance to the next quiz question only AFTER the answer has finished being
// spoken (plus a short pause), so the read-out is never cut off mid-sentence.
// Falls back to a fixed minimum delay when voice is off.
function speakThenAdvance(feedbackText, minVisualMs) {
  const minDelay = minVisualMs || 900;
  let done = false;
  const advance = () => {
    if (done) return;
    done = true;
    state.quizCurrentIndex++;
    nextQuizQuestion();
  };

  if (!state.isVoiceOn) {
    setTimeout(advance, minDelay);
    return;
  }

  const started = Date.now();
  const trailingPauseMs = 450; // small breath after the answer before next question
  VoiceSpeech.speak(feedbackText, () => {
    const elapsed = Date.now() - started;
    const wait = Math.max(trailingPauseMs, minDelay - elapsed);
    setTimeout(advance, wait);
  });

  // Safety net: never stall the quiz if the speech 'end' event never fires
  setTimeout(advance, 12000);
}

// -------------------------------------------------------------
// App Initialization & Event Listeners
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initMapEvents();
  initUIEvents();
  renderMainMenuStats();
  
  // Show welcome toast to explain voice/speech requirement
  setTimeout(() => {
    showToast("🔊 あそびたいモードのボタンをおしてね！");
  }, 1000);
});

// Load state from local storage
function loadSavedState() {
  const savedLearned = localStorage.getItem('learned_prefectures');
  if (savedLearned) {
    state.learnedPrefectures = JSON.parse(savedLearned);
  }
  
  const savedScores = localStorage.getItem('prefectures_high_scores');
  if (savedScores) {
    state.highScores = JSON.parse(savedScores);
  }
}

// Save state to local storage
function saveState() {
  localStorage.setItem('learned_prefectures', JSON.stringify(state.learnedPrefectures));
  localStorage.setItem('prefectures_high_scores', JSON.stringify(state.highScores));
}

// -------------------------------------------------------------
// UI Controls & Settings Event Handlers
// -------------------------------------------------------------
function initUIEvents() {
  // Toggle Ruby (Furigana)
  const btnRuby = document.getElementById('btn-toggle-ruby');
  btnRuby.addEventListener('click', () => {
    state.isRubyOn = !state.isRubyOn;
    if (state.isRubyOn) {
      document.body.classList.remove('ruby-off');
      btnRuby.classList.remove('active');
      btnRuby.querySelector('.btn-text').innerText = "ふりがな: ON";
      showToast("✨ ふりがな が ON になったよ！");
    } else {
      document.body.classList.add('ruby-off');
      btnRuby.classList.add('active');
      btnRuby.querySelector('.btn-text').innerText = "ふりがな: OFF";
      showToast("✨ ふりがな が OFF になったよ！");
    }
    // Re-render inspected prefecture sidebar to update text immediately if shown
    if (state.selectedCode && state.mode === 'learn') {
      inspectPrefecture(state.selectedCode);
    }
  });

  // Toggle Sound effects
  const btnSound = document.getElementById('btn-toggle-sound');
  btnSound.addEventListener('click', () => {
    state.isSoundOn = !state.isSoundOn;
    SoundSynth.init(); // Warm up AudioContext on click
    if (state.isSoundOn) {
      btnSound.classList.remove('active');
      btnSound.querySelector('.icon').innerText = "🔊";
      btnSound.querySelector('.btn-text').innerText = "おと: ON";
      SoundSynth.playCorrect();
      showToast("🔊 効果音（こうかおん）が ON になったよ！");
    } else {
      btnSound.classList.add('active');
      btnSound.querySelector('.icon').innerText = "🔇";
      btnSound.querySelector('.btn-text').innerText = "おと: OFF";
      showToast("🔇 効果音（こうかおん）が OFF になったよ。");
    }
  });

  // Toggle Voice Read-out
  const btnVoice = document.getElementById('btn-toggle-voice');
  btnVoice.addEventListener('click', () => {
    state.isVoiceOn = !state.isVoiceOn;
    if (state.isVoiceOn) {
      btnVoice.classList.remove('active');
      btnVoice.querySelector('.icon').innerText = "🗣️";
      btnVoice.querySelector('.btn-text').innerText = "こえ: ON";
      VoiceSpeech.speak("こえ を オン にしたよ！");
      showToast("🗣️ 読み上げ（よみあげ）が ON になったよ！");
    } else {
      btnVoice.classList.add('active');
      btnVoice.querySelector('.icon').innerText = "🔇";
      btnVoice.querySelector('.btn-text').innerText = "こえ: OFF";
      showToast("🔇 読み上げ（よみあげ）が OFF になったよ。");
    }
  });

  // Mark Learned Checkbox clicked
  const btnMarkLearned = document.getElementById('btn-mark-learned');
  btnMarkLearned.addEventListener('click', () => {
    if (!state.selectedCode) return;
    const code = state.selectedCode;
    const isCurrentlyLearned = !!state.learnedPrefectures[code];
    
    if (isCurrentlyLearned) {
      delete state.learnedPrefectures[code];
      btnMarkLearned.classList.remove('checked');
      btnMarkLearned.querySelector('.checkbox').innerText = "⬜";
      updateMascot('mascot-learn-hint', 'mascot-learn-text', 'happy', "もういちど おぼえなおそう！💪🐳");
    } else {
      state.learnedPrefectures[code] = true;
      btnMarkLearned.classList.add('checked');
      btnMarkLearned.querySelector('.checkbox').innerText = "✅";
      SoundSynth.playCorrect();
      updateMascot('mascot-learn-hint', 'mascot-learn-text', 'success', "おぼえたね！すごい！たいへんよくできました！🎉🐳");
    }
    
    saveState();
    renderMainMenuStats();
  });
}

// Display quick toast notification
function showToast(message) {
  const toast = document.getElementById('sound-toast');
  toast.innerText = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 2200);
}

// -------------------------------------------------------------
// Main Navigation & Modes
// -------------------------------------------------------------
function selectMode(mode) {
  state.mode = mode;
  SoundSynth.init();
  
  // Switch visible screens
  document.getElementById('screen-mode').classList.remove('active');
  document.getElementById('screen-game').classList.add('active');
  
  // Reset region selector on screen change
  document.getElementById('select-region').value = 'all';
  state.region = 'all';

  // Configure sidebar panel based on mode
  document.getElementById('panel-info').classList.remove('active');
  document.getElementById('panel-quiz-choices').classList.remove('active');
  document.getElementById('panel-quiz-result').classList.remove('active');
  document.getElementById('quiz-status-bar').classList.remove('active');

  // Reset inspected class of prefectures
  document.querySelectorAll('.prefecture').forEach(el => el.classList.remove('inspected', 'region-hint'));

  if (mode === 'learn') {
    document.getElementById('panel-info').classList.add('active');
    // Hide specific learning states
    document.querySelector('.info-empty-state').style.display = 'block';
    document.querySelector('.info-content-state').style.display = 'none';
    state.selectedCode = null;
    applyRegionFiltering();
    updateMascot('mascot-learn-empty', null, 'happy', null);
    VoiceSpeech.speak("ちず を クリック して、しらべて みよう！");
  } else if (mode === 'quiz-a') {
    document.getElementById('quiz-status-bar').classList.add('active');
    updateMascot('mascot-status', null, 'happy', null);
    startQuiz();
  } else if (mode === 'quiz-b') {
    document.getElementById('quiz-status-bar').classList.add('active');
    document.getElementById('panel-quiz-choices').classList.add('active');
    updateMascot('mascot-status', null, 'happy', null);
    updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'happy', "光（ひか）っている県（けん）の名前はなあに？下の4つからえらんでね！🐶");
    startQuiz();
  } else if (mode === 'quiz-c') {
    document.getElementById('quiz-status-bar').classList.add('active');
    document.getElementById('panel-quiz-choices').classList.add('active');
    updateMascot('mascot-status', null, 'happy', null);
    updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'happy', "光（ひか）っている県（けん）の県庁所在地（けんちょうしょざいち）はなあに？下の4つからえらんでね！🐳");
    startQuiz();
  }
}

function goBackToMenu() {
  state.mode = 'menu';
  
  // Switch visible screens
  document.getElementById('screen-game').classList.remove('active');
  document.getElementById('screen-mode').classList.add('active');
  
  // Clean up any flashing target map animations
  document.querySelectorAll('.prefecture').forEach(el => {
    el.classList.remove('quiz-target', 'correct-blink', 'wrong-blink', 'dimmed', 'inspected', 'region-hint');
  });

  // Mascot reset
  updateMascot('mascot-menu', null, 'happy', null);

  renderMainMenuStats();
}

// -------------------------------------------------------------
// Interactive SVG Map Configuration
// -------------------------------------------------------------
function initMapEvents() {
  // Remove all <title> tags from the SVG map to prevent browser tooltips (spoiling quizzes)
  document.querySelectorAll('#svg-map-container title').forEach(el => el.remove());

  const prefectures = document.querySelectorAll('.prefecture');
  
  prefectures.forEach((pref) => {
    pref.addEventListener('click', (e) => {
      const code = pref.getAttribute('data-code');
      handlePrefectureClick(code);
    });
  });
}

function handlePrefectureClick(code) {
  if (state.mode === 'learn') {
    inspectPrefecture(code);
  } else if (state.mode === 'quiz-a') {
    submitQuizAClick(code);
  }
}

// Filter which prefectures are clickable/colored based on region
function changeRegion(newRegion) {
  state.region = newRegion;
  
  if (state.mode === 'learn') {
    // Reset inspected state when switching regions
    document.querySelectorAll('.prefecture').forEach(el => el.classList.remove('inspected'));
    document.querySelector('.info-empty-state').style.display = 'block';
    document.querySelector('.info-content-state').style.display = 'none';
    state.selectedCode = null;
    applyRegionFiltering();
  } else {
    // Restart quiz with new region subset
    startQuiz();
  }
}

function applyRegionFiltering() {
  const prefectures = document.querySelectorAll('.prefecture');
  prefectures.forEach((el) => {
    const code = el.getAttribute('data-code');
    const prefInfo = PREFECTURES[code];
    
    if (state.region === 'all' || prefInfo.region === state.region) {
      el.classList.remove('dimmed');
    } else {
      el.classList.add('dimmed');
    }
  });
}

// -------------------------------------------------------------
// Learn Mode Details Engine
// -------------------------------------------------------------
function inspectPrefecture(code) {
  state.selectedCode = code;
  
  // Toggle inspected visual outline class on map SVG
  document.querySelectorAll('.prefecture').forEach(el => {
    if (el.getAttribute('data-code') === code) {
      el.classList.add('inspected');
    } else {
      el.classList.remove('inspected');
    }
  });

  // Switch display container inside learning sidebar
  document.querySelector('.info-empty-state').style.display = 'none';
  document.querySelector('.info-content-state').style.display = 'block';

  const pref = PREFECTURES[code];
  const regionName = REGIONS[pref.region];

  // Populate data using ruby HTML helper for child-friendly Furigana
  document.getElementById('info-prefecture-region').innerHTML = getRubyHtml(regionName);
  document.getElementById('info-prefecture-name').innerHTML = getRubyHtml(pref.name, pref.kana);
  document.getElementById('info-prefecture-capital').innerHTML = getRubyHtml(pref.capital, pref.capitalKana);
  document.getElementById('info-prefecture-desc').innerHTML = getRubyHtml(pref.info);

  // Configure Mark Learned button state
  const btnMark = document.getElementById('btn-mark-learned');
  if (state.learnedPrefectures[code]) {
    btnMark.classList.add('checked');
    btnMark.querySelector('.checkbox').innerText = "✅";
  } else {
    btnMark.classList.remove('checked');
    btnMark.querySelector('.checkbox').innerText = "⬜";
  }

  // Voice Speech: Read prefecture name & fun fact
  // Split fact to read nicely
  const voiceName = pref.kana;
  const voiceFact = pref.info.replace(/（[^）]*）/g, ""); // Remove parenthesis clarifications for audio
  VoiceSpeech.speak(`${voiceName}。${voiceFact}`);

  // Update learn mode mascot hint
  updateMascot('mascot-learn-hint', 'mascot-learn-text', 'happy', `「${pref.kana}」についておぼえよう！おぼえたらボタンをおしてね！🐳`);
}

// Helper to return Furigana Markup
// This maps key vocabulary so that it automatically gets customized Furigana Rubies!
function getRubyHtml(text, forcedKana = null) {
  if (forcedKana) {
    return `<ruby>${text}<rt>${forcedKana}</rt></ruby>`;
  }
  
  // Custom quick parser mapping kanji words commonly found in info to their furiganas
  const furiganaMap = {
    "日本": "にほん",
    "広い": "ひろい",
    "広い県": "ひろいけん",
    "広いところ": "ひろいところ",
    "広いよ": "ひろいよ",
    "山": "やま",
    "川": "かわ",
    "海": "うみ",
    "広い川": "ひろいかわ",
    "冷たい": "つめたい",
    "雪": "ゆき",
    "白い": "しろい",
    "青い": "あおい",
    "赤い": "あかい",
    "富士山": "ふじさん",
    "２番目": "にばんめ",
    "一番": "いちばん",
    "世界遺産": "せかいいさん",
    "湖": "みずうみ",
    "首都": "しゅと",
    "中心": "ちゅうしん",
    "日本一": "にほんいち",
    "食べる": "たべる",
    "名物": "めいぶつ",
    "秋田犬": "あきたけん",
    "将棋": "しょうぎ",
    "落花生": "らっかせい",
    "飛行場": "ひこうじょう",
    "大仏さま": "だいぶつさま",
    "恐竜": "きょうりゅう",
    "恐竜の": "きょうりゅうの",
    "恐竜王国": "きょうりゅうおうこく",
    "金箔": "きんぱく",
    "白川郷": "しらかわごう",
    "琵琶湖": "びわこ",
    "信楽焼": "しがらきやき",
    "真ん中": "まんなか",
    "お城": "おしろ",
    "姫路城": "ひめじじょう",
    "大仏さま": "だいぶつさま",
    "砂丘": "さきゅう",
    "厳島神社": "いつくしまじんじゃ",
    "阿波おどり": "あわおどり",
    "讃岐うどん": "さぬきうどん",
    "有田焼": "ありたやき",
    "熊本城": "くまもとじょう",
    "越前ガニ": "えちぜんがに",
    "伊勢神宮": "いせじんぐう",
    "道後温泉": "どうごおんせん",
    "坂本龍馬": "さかもとりょうま",
    "東大寺": "とうだいじ",
    "出雲大社": "いづもたいしゃ",
    "阿蘇山": "あそさん",
    "桜島": "さくらじま",
    "政治": "せいじ",
    "経済": "けいざい",
    "温泉": "おんせん",
    "温泉街": "おんせんがい",
    "動物園": "どうぶつえん",
    "果物": "くだもの",
    "落花生": "らっかせい",
    "落花生・ピーナッツ": "らっかせい・ピーナッツ",
    "手羽先": "てばさき",
    "真面目": "まじめ",
    "名産品": "めいさんひん",
    "県庁所在地": "けんちょうしょざいち",
    "地方名": "ちほうめい",
    "特産品": "とくさんひん",
    "しゅうかく量": "しゅうかくりょう",
    "収穫量": "しゅうかくりょう",
    "しゅうかく量が": "しゅうかくりょうが",
    "お米": "おこめ",
    "美味しい": "おいしい",
    "食べる": "たべる",
    "有名": "ゆうめい",
    "国": "くに",
    "空": "そら",
    "大きな": "おおきな",
    "大きなお城": "おおきなおしろ",
    "大きな島": "おおきなしま",
    "古い": "ふるい",
    "長い": "ながい",
    "多い": "おおい",
    "高い": "たかい",
    "火山": "かざん",
    "武士": "ぶし",
    "科学": "かがく",
    "研究": "けんきゅう",
    "魔除け": "まよけ",
    "高級": "こうきゅう",
    "お魚": "おさかな",
    "お寺": "おてら",
    "神社": "じんじゃ",
    "砂": "すな",
    "お家": "おうち",
    "三角": "さんかく",
    "気球": "ききゅう",
    "外国": "がいこく",
    "鳥居": "とりい",
    "世界中": "せかいじゅう",
    "自動車": "じどうしゃ",
    "粘土": "ねんど",
    "お皿": "おさら",
    "真珠": "しんじゅ",
    "海女さん": "あまさん",
    "美しく": "うつくしく",
    "美しい": "うつくしい",
    "名家": "めいか",
    "牛": "うし",
    "カツオ": "かつお",
    "サケ": "さけ",
    "カニ": "かに",
    "フグ": "ふぐ",
    "貝": "かい",
    "シャチ": "しゃち"
  };

  // Sort keys in descending order of length to prevent nested substring replacement bugs
  const sortedKeys = Object.keys(furiganaMap).sort((a,b) => b.length - a.length);

  // Escape any RegExp metacharacters that might appear in a key
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let result = text;
  const replacements = [];

  // First pass: swap each matched word for an index-based sentinel token.
  // The token contains NO Japanese (only  delimiters + a number), so a
  // later/shorter key can never match inside it — this prevents the old
  // "##RUBY_" placeholders from leaking into the visible text.
  sortedKeys.forEach((kanji) => {
    const kana = furiganaMap[kanji];
    const regex = new RegExp(escapeRegExp(kanji), 'g');
    result = result.replace(regex, () => {
      const token = `${replacements.length}`;
      replacements.push(`<ruby>${kanji}<rt>${kana}</rt></ruby>`);
      return token;
    });
  });

  // Second pass: turn the sentinel tokens back into ruby markup
  replacements.forEach((html, i) => {
    result = result.split(`${i}`).join(html);
  });

  return result;
}

// Helper to update mascot image and bubble text
function updateMascot(mascotId, bubbleId, emotion, text) {
  const mascotEl = document.getElementById(mascotId);
  const bubbleEl = document.getElementById(bubbleId);
  if (mascotEl) {
    if (emotion === 'happy') {
      mascotEl.src = 'images/mascot_happy.png';
    } else if (emotion === 'success') {
      mascotEl.src = 'images/mascot_success.png';
    } else if (emotion === 'sad') {
      mascotEl.src = 'images/mascot_sad.png';
    }
  }
  if (bubbleEl && text) {
    bubbleEl.innerHTML = text;
  }
}

// -------------------------------------------------------------
// Quiz Engine (Common for A & B)
// -------------------------------------------------------------
function startQuiz() {
  // Collect prefecture codes belonging to current selected region
  let codes = [];
  Object.keys(PREFECTURES).forEach((code) => {
    if (state.region === 'all' || PREFECTURES[code].region === state.region) {
      codes.push(code);
    }
  });

  // Shuffle codes using Fisher-Yates shuffle algorithm
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }

  state.quizQueue = codes;
  state.quizCurrentIndex = 0;
  state.quizCorrectCount = 0;

  // Render elements in sidebar
  document.getElementById('panel-quiz-result').classList.remove('active');
  if (state.mode === 'quiz-b') {
    document.getElementById('panel-quiz-choices').classList.add('active');
  }

  // De-highlight map
  document.querySelectorAll('.prefecture').forEach(el => {
    el.classList.remove('quiz-target', 'correct-blink', 'wrong-blink', 'dimmed', 'inspected', 'region-hint');
  });

  // Apply dimmed filter to non-participating prefectures
  applyRegionFiltering();

  nextQuizQuestion();
}

function nextQuizQuestion() {
  if (state.quizCurrentIndex >= state.quizQueue.length) {
    finishQuiz();
    return;
  }

  state.quizCurrentTarget = state.quizQueue[state.quizCurrentIndex];
  const targetPref = PREFECTURES[state.quizCurrentTarget];

  // Reset animations on map path groups
  document.querySelectorAll('.prefecture').forEach(el => {
    el.classList.remove('quiz-target', 'correct-blink', 'wrong-blink', 'region-hint');
  });

  // Update Status Bar info
  document.getElementById('quiz-score-correct').innerText = state.quizCorrectCount;
  document.getElementById('quiz-total-questions').innerText = state.quizQueue.length;
  
  const percentage = (state.quizCurrentIndex / state.quizQueue.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${percentage}%`;

  if (state.mode === 'quiz-a') {
    // Mode A: Click target on Map
    const textHtml = `「${getRubyHtml(targetPref.name, targetPref.kana)}」は どこかな？地図の上を タップ してね！`;
    document.getElementById('quiz-question-text').innerHTML = textHtml;
    
    // Mascot update
    updateMascot('mascot-status', null, 'happy', null);
    
    // Voice prompt
    VoiceSpeech.speak(`${targetPref.kana}はどこかな？クリックしてね！`);
  } 
  else if (state.mode === 'quiz-b') {
    // Mode B: Select 4 multiple choices
    const textHtml = "光っている県（けん）の名前は なあに？";
    document.getElementById('quiz-question-text').innerHTML = textHtml;

    // Highlight target on map
    const targetEl = document.querySelector(`.prefecture[data-code="${state.quizCurrentTarget}"]`);
    if (targetEl) {
      targetEl.classList.add('quiz-target');
    }

    generateChoices();
    renderChoices();
    
    // Mascot update
    updateMascot('mascot-status', null, 'happy', null);
    updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'happy', "光（ひか）っている県（けん）の名前はなあに？<br>下の4つからえらんでね！🐳");
    
    // Voice prompt
    VoiceSpeech.speak("光っている県はなんという名前かな？選んでね！");
  }
  else if (state.mode === 'quiz-c') {
    // Mode C: Select 4 multiple choices for capital city
    const textHtml = "光っている県（けん）の 県庁所在地（けんちょうしょざいち）は なあに？";
    document.getElementById('quiz-question-text').innerHTML = textHtml;

    // Highlight target on map
    const targetEl = document.querySelector(`.prefecture[data-code="${state.quizCurrentTarget}"]`);
    if (targetEl) {
      targetEl.classList.add('quiz-target');
    }

    generateChoices();
    renderChoices();
    
    // Mascot update
    updateMascot('mascot-status', null, 'happy', null);
    updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'happy', "光（ひか）っている県（けん）の県庁所在地（けんちょうしょざいち）はなあに？<br>下の4つからえらんでね！🐳");
    
    // Voice prompt
    VoiceSpeech.speak("光っている県の県庁所在地はなんという名前かな？選んでね！");
  }
}

// Generate multiple choices for Mode B
function generateChoices() {
  const correctCode = state.quizCurrentTarget;
  
  // Gather other dummy candidate codes in the same region, if not enough fallback to all Japan
  let regionPool = Object.keys(PREFECTURES).filter(code => 
    code !== correctCode && 
    (PREFECTURES[code].region === PREFECTURES[correctCode].region)
  );

  if (regionPool.length < 3) {
    regionPool = Object.keys(PREFECTURES).filter(code => code !== correctCode);
  }

  // Shuffle pool and slice 3
  for (let i = regionPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regionPool[i], regionPool[j]] = [regionPool[j], regionPool[i]];
  }
  
  const dummies = regionPool.slice(0, 3);
  
  // Merge and shuffle correct code + dummies
  let choices = [correctCode, ...dummies];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  state.quizChoices = choices;
}

// Render choices in B Panel
function renderChoices() {
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach((btn, index) => {
    btn.className = "choice-btn"; // Reset status colors
    btn.disabled = false;
    
    const code = state.quizChoices[index];
    const pref = PREFECTURES[code];
    if (state.mode === 'quiz-c') {
      btn.innerHTML = getRubyHtml(pref.capital, pref.capitalKana);
    } else {
      btn.innerHTML = getRubyHtml(pref.name, pref.kana);
    }
  });
}

// -------------------------------------------------------------
// Quiz Action Submissions & Judgements
// -------------------------------------------------------------

// Mode A Click Judgement
function submitQuizAClick(clickedCode) {
  const targetCode = state.quizCurrentTarget;
  const targetEl = document.querySelector(`.prefecture[data-code="${clickedCode}"]`);
  
  if (clickedCode === targetCode) {
    // CORRECT!
    SoundSynth.playCorrect();
    state.quizCorrectCount++;

    // Mascot update
    updateMascot('mascot-status', null, 'success', null);

    // Clear any region hint that was shown after a previous wrong guess
    clearRegionHint();

    if (targetEl) {
      targetEl.classList.add('correct-blink');
    }

    // Announce the answer, then move on only once it has finished speaking
    const targetPref = PREFECTURES[targetCode];
    speakThenAdvance(`せいかい！ここが${targetPref.kana}だよ！`, 900);
  } else {
    // WRONG!
    SoundSynth.playWrong();

    // Mascot update
    updateMascot('mascot-status', null, 'sad', null);

    if (targetEl) {
      targetEl.classList.add('wrong-blink');
      setTimeout(() => {
        targetEl.classList.remove('wrong-blink');
      }, 500);
    }

    // Tell the child which prefecture they actually clicked, then give a hint
    const targetPref = PREFECTURES[targetCode];
    const clickedPref = PREFECTURES[clickedCode];
    const hintRegion = REGIONS[targetPref.region];

    // Visual hint: outline & glow the whole region the answer belongs to
    highlightRegionHint(targetPref.region);

    // Also show the region hint in the question text for kids who can read
    const questionEl = document.getElementById('quiz-question-text');
    questionEl.innerHTML = `「${getRubyHtml(targetPref.name, targetPref.kana)}」は どこかな？` +
      `<br><span class="quiz-hint">💡 ヒント：<b>${hintRegion}</b>地方を さがしてね！</span>`;

    VoiceSpeech.speak(`ちがうよ！そこは${clickedPref.kana}だよ。${targetPref.kana}は、${hintRegion}地方にあるよ！さがしてみてね！`);
  }
}

// Outline every prefecture in the given region as a visual hint on the map
function highlightRegionHint(region) {
  document.querySelectorAll('.prefecture').forEach(el => {
    const code = el.getAttribute('data-code');
    const pref = PREFECTURES[code];
    if (pref && pref.region === region) {
      el.classList.add('region-hint');
    } else {
      el.classList.remove('region-hint');
    }
  });
}

// Remove the region hint outline from the whole map
function clearRegionHint() {
  document.querySelectorAll('.prefecture.region-hint').forEach(el => {
    el.classList.remove('region-hint');
  });
}

// Mode B/C Multiple Choice Judgement
function submitChoice(choiceIndex) {
  const selectedCode = state.quizChoices[choiceIndex];
  const targetCode = state.quizCurrentTarget;
  const targetPref = PREFECTURES[targetCode];
  
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(btn => btn.disabled = true); // Disable after clicking

  if (selectedCode === targetCode) {
    // CORRECT!
    SoundSynth.playCorrect();
    state.quizCorrectCount++;
    
    // Mascot update
    updateMascot('mascot-status', null, 'success', null);
    let feedbackVoice;
    if (state.mode === 'quiz-c') {
      updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'success', `せいかい！${targetPref.name}の県庁所在地は「${targetPref.capital}」だよ！🎉`);
      feedbackVoice = `せいかい！${targetPref.kana}の県庁所在地は${targetPref.capitalKana}だよ！`;
    } else {
      updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'success', "せいかい！やったね！大正解（だいせいかい）だよ！🎉");
      feedbackVoice = `せいかい！やったね！ここは${targetPref.kana}だよ！`;
    }

    buttons[choiceIndex].classList.add('correct');

    const targetEl = document.querySelector(`.prefecture[data-code="${targetCode}"]`);
    if (targetEl) {
      targetEl.classList.remove('quiz-target');
      targetEl.classList.add('correct-blink');
    }

    // Wait until the whole answer has been spoken before the next question
    speakThenAdvance(feedbackVoice, 1200);
  } else {
    // WRONG!
    SoundSynth.playWrong();
    
    // Mascot update
    updateMascot('mascot-status', null, 'sad', null);
    let feedbackVoice;
    if (state.mode === 'quiz-c') {
      updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'sad', `ざんねん！正解（せいかい）は「${targetPref.capital}」だよ。どんまい！🐳`);
      feedbackVoice = `ざんねん！${targetPref.kana}の県庁所在地は${targetPref.capitalKana}だよ！`;
    } else {
      updateMascot('mascot-quiz-b', 'mascot-quiz-b-text', 'sad', `ざんねん！正解（せいかい）は「${targetPref.name}」だよ。どんまい！🐳`);
      feedbackVoice = `ざんねん！正解は${targetPref.kana}だよ！`;
    }

    buttons[choiceIndex].classList.add('wrong');
    // Highlight correct button so child learns
    const correctIndex = state.quizChoices.indexOf(targetCode);
    buttons[correctIndex].classList.add('correct');

    const targetEl = document.querySelector(`.prefecture[data-code="${targetCode}"]`);
    if (targetEl) {
      targetEl.classList.remove('quiz-target');
      targetEl.classList.add('wrong-blink');
    }

    // Give the child time to hear the full answer before moving on
    speakThenAdvance(feedbackVoice, 2200);
  }
}

// -------------------------------------------------------------
// Quiz Finish & Celebration Confetti
// -------------------------------------------------------------
function finishQuiz() {
  // Update progress bar to full 100%
  document.getElementById('quiz-progress-fill').style.width = `100%`;
  
  // Sound clear tune
  SoundSynth.playClear();

  // Hide sidebars and display result panel
  document.getElementById('panel-quiz-choices').classList.remove('active');
  document.getElementById('panel-quiz-result').classList.add('active');

  const scoreText = `${state.quizCorrectCount} / ${state.quizQueue.length}`;
  document.getElementById('quiz-result-score').innerText = scoreText;

  // Formulate success feedback message
  let title = "たいへんよくできました！";
  let message = "つぎは ぜんもんせいかい を めざして がんばろう！";
  let showMedal = false;
  let medalEmoji = "⭐";

  const successRatio = state.quizCorrectCount / state.quizQueue.length;

  if (state.quizCorrectCount === state.quizQueue.length) {
    title = "🎉 パーフェクト！";
    message = "すごい！キミは 完ぺき（かんぺき）な ちずマスターだ！";
    showMedal = true;
    
    // Unblock Medal Stamp rewards based on region
    const medalKey = `medal-${state.region}`;
    state.highScores[medalKey] = true;
    
    // Choose appropriate medal emoji
    const medalEmojis = {
      "all": "👑",
      "hokkaido-tohoku": "🌸",
      "kanto": "⭐",
      "chubu": "🌳",
      "kinki": "🏮",
      "chugoku-shikoku": "🍊",
      "kyushu-okinawa": "🌺"
    };
    medalEmoji = medalEmojis[state.region] || "🏅";
  } else if (successRatio >= 0.8) {
    title = "✨ おしい！あとすこし！";
    message = "とっても すごいね！ あとちょっとで パーフェクト！";
  } else if (successRatio >= 0.5) {
    title = "👍 がんばったね！";
    message = "ナイスファイト！たくさん くりかえし あそんで おぼえよう！";
  }

  document.getElementById('quiz-result-title').innerHTML = getRubyHtml(title);
  document.getElementById('quiz-result-message').innerHTML = getRubyHtml(message);

  // Mascot finish quiz update
  let mascotText = "おつかれさま！がんばったね！🐳✨";
  let mascotEmotion = 'happy';
  
  if (state.quizCorrectCount === state.quizQueue.length) {
    mascotText = "パーフェクト！すごい！キミは完ぺきなちずマスターだ！👑🐳✨";
    mascotEmotion = 'success';
  } else if (successRatio >= 0.8) {
    mascotText = "あとすこしでパーフェクト！とってもおしかったね！つぎもがんばろう！🐳✨";
    mascotEmotion = 'success';
  } else if (successRatio >= 0.5) {
    mascotText = "半分（はんぶん）せいかい！がんばったね！なんどもあそんでおぼえよう！🐳👍";
    mascotEmotion = 'happy';
  } else {
    mascotText = "どんまい！ぼくと いっしょに すこしずつ おぼえていこうね！🐳🌊";
    mascotEmotion = 'sad';
  }

  updateMascot('mascot-result', 'mascot-result-text', mascotEmotion, mascotText);

  // Render Gold Reward Stamp clear animation if perfect score achieved
  const rewardEl = document.getElementById('quiz-medal-reward');
  if (showMedal) {
    rewardEl.innerText = medalEmoji;
    rewardEl.style.display = 'flex';
    VoiceSpeech.speak("パーフェクト！すごいね！合格メダルをプレゼント！");
    triggerConfetti();
  } else {
    rewardEl.style.display = 'none';
    VoiceSpeech.speak(`${state.quizQueue.length}問中、${state.quizCorrectCount}問せいかい！がんばったね！`);
  }

  // Update HighScore metrics
  const scoreKey = `${state.mode}-${state.region}`;
  const currentHighScore = state.highScores[scoreKey] || 0;
  if (state.quizCorrectCount > currentHighScore) {
    state.highScores[scoreKey] = state.quizCorrectCount;
  }
  
  saveState();
}

function restartQuiz() {
  startQuiz();
}

// -------------------------------------------------------------
// Main Screen Statistics & Medals Renderer
// -------------------------------------------------------------
function renderMainMenuStats() {
  // Count inspected and checked learning progress
  const learnedCount = Object.keys(state.learnedPrefectures).length;
  document.getElementById('stat-learned-count').innerText = `${learnedCount} / 47`;

  // Find overall highest score across any national quizzes
  const scoreQuizA = state.highScores['quiz-a-all'] || 0;
  const scoreQuizB = state.highScores['quiz-b-all'] || 0;
  const scoreQuizC = state.highScores['quiz-c-all'] || 0;
  const maxScore = Math.max(scoreQuizA, scoreQuizB, scoreQuizC);
  document.getElementById('stat-high-score').innerText = `${maxScore} / 47`;

  // Render clear medal stamps cabinet
  const cabinet = document.getElementById('medal-cabinet');
  cabinet.innerHTML = ''; // Reset

  const medalConfigs = [
    { key: 'medal-all', name: 'ぜんこく', emoji: '👑' },
    { key: 'medal-hokkaido-tohoku', name: 'きた日本', emoji: '🌸' },
    { key: 'medal-kanto', name: 'かんとう', emoji: '⭐' },
    { key: 'medal-chubu', name: 'ちゅうぶ', emoji: '🌳' },
    { key: 'medal-kinki', name: 'かんさい', emoji: '🏮' },
    { key: 'medal-chugoku-shikoku', name: 'ちゅうしこ', emoji: '🍊' },
    { key: 'medal-kyushu-okinawa', name: 'みなみ日本', emoji: '🌺' }
  ];

  medalConfigs.forEach((cfg) => {
    const medalEl = document.createElement('div');
    const isUnlocked = !!state.highScores[cfg.key];
    
    medalEl.className = `medal ${isUnlocked ? 'active' : ''}`;
    medalEl.innerText = isUnlocked ? cfg.emoji : '🔒';
    
    // Accessible tooltip text for children explaining how to unlock
    const tooltipText = isUnlocked 
      ? `合格！「${cfg.name}」` 
      : `${cfg.name} クイズを満点で解放！`;
    medalEl.setAttribute('data-tooltip', tooltipText);
    
    cabinet.appendChild(medalEl);
  });
}

// -------------------------------------------------------------
// Celebration Confetti (Self-Contained Canvas Particles)
// -------------------------------------------------------------
let confettiInterval = null;
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';

  // Make canvas cover viewport
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#ec4899'];
  const particles = [];
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 5 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
      oscillation: Math.random() * 3,
      oscillationSpeed: Math.random() * 0.05 + 0.02,
      angle: Math.random() * Math.PI
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    let activeParticles = 0;
    
    particles.forEach((p) => {
      p.y += p.speed;
      p.angle += p.oscillationSpeed;
      p.x += Math.sin(p.angle) * p.oscillation;
      p.rotation += p.rotationSpeed;

      // Draw particle as a cute rotated square or circle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y < height + 20) {
        activeParticles++;
      } else if (Date.now() - startTime < 4000) {
        // Recycle particles for 4 seconds
        p.y = -20;
        p.x = Math.random() * width;
        activeParticles++;
      }
    });

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(animationFrameId);
    }
  }

  animate();
}


