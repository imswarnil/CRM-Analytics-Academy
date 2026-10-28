---
title: "アナリティクス ダッシュボード デザイン — 実践的な質問"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "チャートタイプを選ぶ前に尋ねる最初の質問は何ですか?"
    options:
      - "ブランドカラーのどのタイプが最適ですか?"
      - "読者が何をすべきか?"
      - "データセットの行数は?"
      - "どのタイプが CRM Analytics サポート"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "主に値ではなく、アルファベット順に並べ替えられたバーチャート:"
    options:
      - "レンダリングの高速化"
      - "ランキングを非表示にします。これは通常、誰かがバーチャートを引いた理由です"
      - "より正確です"
      - "違いはありません"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "40のカテゴリと1つの測定で1つの次元があります。 最高の最初の選択はあります:"
    options:
      - "パイチャート"
      - "タイトルの限界を持つトップNの水平バーチャート"
      - "ラインチャート"
      - "スキャッタープロット"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "2つの対策と、一緒に動くかどうかを知りたい。 チャートは:"
    options:
      - "デュアル軸線グラフ"
      - "スキャッタープロット、軸ごとの1つの測定"
      - "2つの別々のバーチャート"
      - "積み重ねられたコラム"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "なぜ横は、典型的なバーの垂直よりも優れていますか?"
    options:
      - "それはより速くレンダリングします"
      - "カテゴリ名は単語であり、単語は列の下に回転するのではなく水平軸に沿って読みます"
      - "縦棒は非推奨です"
      - "それはより少ないスペースを使用します"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "列(縦)チャートがバー(横)を打ち負かなければならないとき?"
    options:
      - "常に — 垂直は標準"
      - "月のようにカテゴリが注文された期間であるとき、読者は右に左を実行することを期待します"
      - "多くのカテゴリがある場合"
      - "ラベルが長いとき"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "リーダーがグループ全体で各サブカテゴリを比較する必要がある場合は、グループ化されたか、または積み重ねられますか?"
    options:
      - "スタック — それは合計を示しています"
      - "グループ化 — スタックのボトムセグメントのみがベースラインを共有しているため、他の人は目で比較できません"
      - "どちらの作品も均等に"
      - "隣人; パイを使用する"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "棒グラフの軸線は40ではなく0で始まります。 これは:"
    options:
      - "罰金および標準"
      - "棒を狙う — 棒の長さはエンコーディングであるので、 tuncated 軸線はバー間の比率を誤ります"
      - "読みやすく必須"
      - "印刷の問題だけ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "デュアル軸チャートは6月に渡る収益とヘッドカウントを示しています。 交差はどういう意味ですか?"
    options:
      - "レベニューオーバートックヘッドカウント"
      - "何も — 交差点は、データではなく、2つの軸を設定する場所によって決定されます"
      - "彼らは相関関係である"
      - "6月は休みの翌月でした"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "データセットは活動無しで1か月間行いません。 ラインチャートは、次のものでなければなりません。"
    options:
      - "ギャップを直進する"
      - "ゼロが真の場合、値が本物的に不明な場合のブレイクをゼロに表示します。"
      - "月を隠す"
      - "平均値の解釈"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "作業を停止する前に、ラインチャートを運ぶことができます。"
    options:
      - "ワンポイント"
      - "色や形状で区切るだけで4種類程度"
      - "ログイン"
      - "伝説と無制限"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "読者がそれらを比較できるように停止する前に、どのくらいのスライスはドーナツが運ぶことができますか?"
    options:
      - "3～4名様"
      - "約10分"
      - "ラベル付20代"
      - "制限はありません"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "時間の上の100%の積み重ねられた棒は提示で最もよいです:"
    options:
      - "絶対的な成長"
      - "MIXがシフトしているかどうか - 完全にサイズを隠すコストで"
      - "個々の値"
      - "アトリエ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "正確なパーセンテージが通常最高のコンポジションデータ:"
    options:
      - "ドーナツ"
      - "共有列付きのソートテーブル"
      - "ツリーマップ"
      - "ゲージ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "会社案内は88%です。 なぜ潜在的に役に立たないのでしょうか?"
    options:
      - "それは余りに精密です"
      - "これは、30%と140%でアカウントの平均であり、反対の行動を必要とし、両方の目に見えないことができます。"
      - "パーセンテージは平均できません"
      - "メディアンであるべき"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "棒グラフができない疑問に答えるスキャッタープロット?"
    options:
      - "どのカテゴリが最も大きいか"
      - "2つの施策が一緒に動くかどうか、一度に多くの企業を横断"
      - "時間をかけて何かが変わったか"
      - "各パートの共有"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "バブルチャートの3番目の測定は以下のようにエンコードされます。"
    options:
      - "カラー"
      - "バブルエリア"
      - "第三軸の位置"
      - "ラベルのサイズ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "何をするのか KPI アクション可能な数値?"
    options:
      - "より大きなフォント"
      - "比較と方向 - 計画または最後の期間に対して、矢印"
      - "通貨記号"
      - "色付きの背景"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "ゲージはよい選択時です:"
    options:
      - "シングルナンバーの表示"
      - "正式に固定されたターゲットがあり、質問は「どのように近いのか」です。"
      - "数値はパーセンテージ"
      - "スペース限定"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "15.3から14.2ヶ月にCACペイバックが落ちました。 矢印は:"
    options:
      - "ダウンと赤"
      - "ダウンとグリーン — 優しさは、方向ではなく、メトリックのプロパティです"
      - "アップ&グリーン"
      - "矢印なし"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "テーブルがチャートを破るとき?"
    options:
      - "決してない"
      - "各行のアイデンティティが重要であるとき — どのアカウントを処理します。"
      - "20行以上ある場合"
      - "データがテキストの場合"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "ダッシュボードのスクロールバーを持つテーブルは通常、次の手段を意味します。"
    options:
      - "よい情報密度"
      - "ダッシュボードウィジェットではなくデータエクスポートになっています"
      - "行はソートが必要です"
      - "フォントが大きすぎる"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "テーブルの数字は以下でなければなりません。"
    options:
      - "テキストで左揃え"
      - "一貫した小数で整列するので、大きさは一目で比較可能"
      - "センタード"
      - "価値によって着色される"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "6つの販売領域の収益があります。 地図は正しいチャートですか?"
    options:
      - "はい。地域は地理的です"
      - "通常ではなく、6つのカテゴリのソートバーが正確にランク付けされ、マップは読者が色を推定する"
      - "はい、色がアクセス可能であれば"
      - "伝説のみ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "国による生収益のchoroplethは、主に示します。"
    options:
      - "あなたの製品がベストを実行する場所"
      - "ほとんどの人や最大の経済が最も多い場所"
      - "マーケットシェア"
      - "ニュース"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "そのための通常の修正は次のとおりです。"
    options:
      - "異なるカラースケール"
      - "ノーマライズ - 口座当たりの収益、カピタ当たり、または市場規模から"
      - "小さな国を取除く"
      - "バブルマップの利用"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "漏斗は線形スケールの506の機会に2.1,000,000の会合に及びます。 何が起こるか?"
    options:
      - "それは明らかに読みます"
      - "第二段階はスタブで、最も目に見えないステージです。"
      - "チャートのエラー"
      - "パーセンテージが間違っています"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "滝図は以下です。"
    options:
      - "ランキングカテゴリ"
      - "一連の追加と減算がどのように別の合計から得られるかを示す"
      - "2つの施策の比較"
      - "地理データ"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "漏斗の段階は発注されるべきです:"
    options:
      - "サイズによって"
      - "プロセス順序で"
      - "アルファベット順"
      - "転換率によって"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "チャートが正直かどうかの信頼できるテストは?"
    options:
      - "すべての番号が正しい"
      - "読者が4秒で結論づけるものは本当です"
      - "それはブランドパレットを使用します"
      - "それは伝説を持っています"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "y軸の真理は、保持の行図ではなく、バーチャートに守られません。 なぜ?"
    options:
      - "棒は古い技術です"
      - "棒の長さは符号化です、従ってtruncationは棒間の比率を誤ります;ラインは斜面を符号化します"
      - "線は小さい値を示すことができません"
      - "決して守られません"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "ビジネスレポーティングの最も一般的な料理人チャートは次のとおりです。"
    options:
      - "3Dパイ"
      - "デノミネーターを必要とした生の合計 - 率が質問だった数"
      - "ログスケール"
      - "デュアル軸"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "チャートタイプを選択する最初の質問は次のとおりです。"
    options:
      - "行数が多い"
      - "読者が何をすべきか"
      - "どの色も利用できます"
      - "どのタイプか CRM Analytics サポート"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "典型的なバーチャートは、通常、ソートする必要があります。"
    options:
      - "アルファベット順"
      - "測定による降下"
      - "次元のidによって"
      - "ランダム"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "リーダーがグループ全体でサブカテゴリを比較しなければならないとき、積み重ねられたバーではなくグループ化された。"
    options:
      - "スタックは色づらい"
      - "スタックの一番下のセグメントのみがベースラインを共有しているため、残りは目で比較できません。"
      - "グループ化されたバーが狭い"
      - "スタックは合計を表示できません"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "ドーナツは大体で作業を停止します。"
    options:
      - "2つのスライス"
      - "4枚のスライス"
      - "10枚のスライス"
      - "20代のスライス"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "スキャッタープロットの答えだけできる質問は?"
    options:
      - "どのカテゴリが最も大きいか"
      - "2つの施策が多岐に渡るかどうか"
      - "値が時間とともに変化する方法"
      - "各パートが貢献するシェア"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "ツイート KPI 運ぶと、番号がアクション可能になります。"
    options:
      - "より大きなフォント"
      - "比較と方向"
      - "通貨記号"
      - "色付きの背景"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "CAC のペイバックの落下は次のように示すべきです:"
    options:
      - "赤下矢印"
      - "緑の下方矢印 — 正当性は方向ではなく、メトリックに属します"
      - "矢印なし"
      - "上向きの矢印"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "線形スケールの506機会に2.1百万のセッションを spanning漏斗:"
    options:
      - "読書罰金"
      - "後にステージをスタブとしてレンダリングし、ほとんどのステージを隠す"
      - "エラー"
      - "インバート"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "国による生収益のchoroplethは、主に示します。"
    options:
      - "製品市場適合"
      - "最大の人口と経済がどこにあるのか"
      - "ニュース"
      - "マージン"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "ビジネスレポーティングの最も一般的な料理人チャートは次のとおりです。"
    options:
      - "3Dパイチャート"
      - "デノミネーターを必要とした生計"
      - "ログスケール"
      - "積み重ねられた区域"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "レンズが最もよくわかるのは?"
    options:
      - "終了報告"
      - "1つのデータセットの1つの調査のための使い捨て可能なワークスペース"
      - "ダッシュボードテンプレート"
      - "保存されたクエリは管理者のみを作成できます"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "なぜ転換するか SAQL クリックして変更を行った後モード?"
    options:
      - "それはより速く動く"
      - "答えが何であるかを既に知っているので、生成されたクエリを読むことは言語を学ぶための最も安い方法です"
      - "チャートは利用できません。 SAQL モード"
      - "保存する前に必要です"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics グループ化されたチャートをデフォルトでソートします。 なぜ変化しますか?"
    options:
      - "アルファベット順が無効です"
      - "グループ化されたチャートのポイントは通常ランキングで、アルファベット順が非表示になります。"
      - "測定によるソートが高速"
      - "顔面に必要です"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "通常、バーチャートに2番目のグループを追加する:"
    options:
      - "インサイトを倍増"
      - "比較がポイントである場合を除き、大幅に読みにくいと抵抗する価値があります"
      - "ブレイクフェイス"
      - "測定値の変更"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "ラインワームの穀物では、「行のカウント」を意味します。"
    options:
      - "取引件数"
      - "ラインアイテムの数 — 取引のための取引キーの異なるカウントを使用する"
      - "口座数"
      - "商品数"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "グラフは、実質的に高い収益を持つセグメントを示しています。 次のステップは?"
    options:
      - "チャートタイプを変更する"
      - "テーブルモードに切り替えて、後ろの行を見て"
      - "レンズを再構築する"
      - "ダッシュボードフィルタをチェック"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL モードは学習者に最も価値があります。"
    options:
      - "クリックよりも速く走る"
      - "あなたが既に知っている答えに対して、あなたのクリックが生成されたクエリが表示されます"
      - "フィルターの唯一の方法"
      - "チャートは日付でグループ化できません"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "自然言語の問い合わせがうまく機能するかどうかは、最も決定していますか?"
    options:
      - "選択したチャートタイプ"
      - "データセットのフィールドメタデータの品質 — ラベル、フォーマット、隠れた配管"
      - "ユーザー数"
      - "リフレッシュスケジュール"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "自然言語の応答の重要な障害モードは、それが:"
    options:
      - "ゆっくりと走る"
      - "質問したもの、ふわふわふわ、違いの兆候がないものよりも微妙に異なる質問に答える"
      - "チャートを生成できません"
      - "リクエスト SAQL 知識"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "レンズは次のように記述します。"
    options:
      - "終了報告"
      - "1つのデータセットの1つの調査のための使い捨て可能なワークスペース"
      - "ダッシュボードテンプレート"
      - "保存される SAQL スクリプト"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "グループ化されたチャート上のデフォルトソートはグループ化です。 通常、次の理由で変更します。"
    options:
      - "アルファベットは無効です"
      - "ランキングは通常ポイントであり、アルファベット順はそれを隠します"
      - "それはより速くレンダリングします"
      - "面取りはそれを必要とします"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "ラインワームの穀物では、使用するべき取引をカウントします。"
    options:
      - "行のカウント"
      - "機会キーの異なるカウント"
      - "額の額"
      - "よくある質問"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "通常、バーチャートに2番目のグループを追加する:"
    options:
      - "インサイトを倍増"
      - "比較がポイントである場合を除き、大幅に読みにくいと抵抗する価値があります"
      - "ブレイクフェイス"
      - "測定値の変更"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "チャートが間違っています。 最も速い診断はあります:"
    options:
      - "チャートタイプを変更する"
      - "テーブルモードに切り替え、行を読み込む"
      - "レンズを再構築する"
      - "シェアする"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "エクスプローラからクエリ言語を学ぶための最善の方法は次のとおりです。"
    options:
      - "機能参照の端を端に読むこと"
      - "クリックして、読みます SAQL あなたが既に知っている答えに対して生成されたあなたのクリック"
      - "ゼロからクエリを書く"
      - "フォーラムから例をコピーする"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "'Stage != Close Lost' というフィルタも削除します。"
    options:
      - "その他"
      - "ステージがnullの列"
      - "クローズドウォン行"
      - "他のデータセットからの列"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "自然言語のクエリ結果は以下のように扱われるべきです。"
    options:
      - "引用への最終回答"
      - "別の質問に答えても流暢に答えるので、テーブルモードで検証する出発点"
      - "免責事項"
      - "保存レンズに相当する"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "ダッシュボードの完成は?"
    options:
      - "リクエストされたウィジェットがすべて表示されます。"
      - "視聴者は、それがあなたのために存在し、迅速かつ迅速に決定することができます"
      - "会社の色を使用する"
      - "空白スペースがない"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "株式所有者は、9つのウィジェットを要求します。 最高の最初の質問は:"
    options:
      - "どのチャートタイプが欲しいですか?"
      - "何が示されたかによって違うのですか?"
      - "次のスプリントまで待つことはできますか?"
      - "データはありますか?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "最も重要な数字はどこにありますか?"
    options:
      - "センター, 最大の"
      - "読書注文が始まる上の左、"
      - "結論として底、"
      - "どこでも; 人々はランダムにスキャンします"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "グループ関連ウィジェットとグループ間でのスペースを組み合わせる理由"
    options:
      - "tidier を見る"
      - "Proximity は関係を暗示します — 一緒に配置されたウィジェットは、彼らが行っているかどうかを、まとめて読みます"
      - "それは性能を改善します"
      - "顔面で必要です"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "なぜ色のデルタも方向矢印またはラベルを運ぶ必要がありますか?"
    options:
      - "それはより多くの専門家を見ます"
      - "色だけでは色調の読者を除外し、印刷やグレースケールのスクリーンショットを存続しません"
      - "矢印はレンダリングに高速です"
      - "お問い合わせ Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "赤/琥珀/緑色のしきい値がどこから来るべきですか?"
    options:
      - "レンジの3分の1"
      - "ビジネス — 誰かが実際に何かを別のものにする番号"
      - "パレットのデフォルト"
      - "平均値"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "ほとんどのセルが色付けされているダッシュボード:"
    options:
      - "最高の情報密度"
      - "信号が残らない - すべてが強調されている場合、何もありません"
      - "アクセシビリティの向上"
      - "より速い負荷時間"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "テーブルがチャートを打つとき?"
    options:
      - "決してない"
      - "各行のアイデンティティが特定のアカウントである場合、その特定の取引"
      - "多くの行がある場合"
      - "データが数値の場合"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "何が変わるか KPI アクション可能なものへの番号?"
    options:
      - "より大きなフォント"
      - "比較 — 計画に対して、最後の期間と方向に対する"
      - "通貨記号"
      - "境界線"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "すべての140アカウントを示す値表は通常です。"
    options:
      - "ツラフ"
      - "ダッシュボードの服を着るデータエクスポート"
      - "正確さのために要求して下さい"
      - "チャートよりも速く"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "ダッシュボードの負荷時間の最大のシングルレバーは通常:"
    options:
      - "チャートタイプ"
      - "異なるクエリの数 — 1つのクエリを共有できるウィジェットが、それぞれ独自のクエリを実行する"
      - "ブラウザの選択"
      - "色深度"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "非常に細かい穀物のデータセットは、ダッシュボードが遅くなります。"
    options:
      - "良い穀物は非効率に貯えられます"
      - "すべてのウィジェットは、すべてのビューアのために、すべての負荷で、クエリ時間で数百万行を集計します"
      - "顔が無効になっています"
      - "インデックス化できません"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "ステージオーダーではなく、ステージオーダーでソートされたファネルはなぜですか?"
    options:
      - "それはより速くレンダリングします"
      - "シーケンスは引数です。つまり、隣接するステージ間のドロップは検索です。"
      - "Salesforce お問い合わせ"
      - "テーブルに合わせて"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "なぜカバレッジウィジェットがスイッチオフに直面しているのですか?"
    options:
      - "パフォーマンス"
      - "四半期全体に対する参照です。他のすべてのものでフィルタリングすると、比較は消えます。"
      - "それは別のデータセットを使用します"
      - "顔のブレイク比率"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "パイプラインの傾向は、月を閉じるのではなく、作成月によってグループ化されます。"
    options:
      - "定休日 不定休"
      - "誤った日付に反して、両方の番号が個別に正しい状態に保たれながら、直近と古い期間を歪める"
      - "作成された月はより速くレンダリングします"
      - "違いはありません"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "ダッシュボードが終了したら:"
    options:
      - "リクエストされたウィジェットがすべて表示されます。"
      - "その聴衆は、それがあなたのために存在し、迅速かつすぐに決定することができます"
      - "それはブランドパレットに一致します"
      - "空白スペースはありません"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "見出し番号は所属しています。"
    options:
      - "センターセンター"
      - "読書注文が始まる上の左、"
      - "ボトム"
      - "フィルターの横"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "左上隅にあるフィルターは間違いです。"
    options:
      - "彼らは遅いです"
      - "彼らは彼らの2番目の訪問まで、誰もニーズを制御するために、画面上で最も貴重なスペースを費やします"
      - "サイズ変更はできません。"
      - "それらはバインドできません"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "ウィジェットのタイトルは、"
    options:
      - "測定のみ"
      - "測定値、期間、フィルタと制限値 — コンテキストなしでスクリーンショットを撮影します"
      - "著者の名前"
      - "データセット名"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "ファネルチャートはソートする必要があります:"
    options:
      - "サイズ降下で"
      - "プロセス順序で"
      - "アルファベット順"
      - "ご利用日"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "なぜ色のデルタも矢印またはラベルを運ぶ必要がありますか?"
    options:
      - "エステ"
      - "色だけでは、グレースケールのカラー盲導体とダイを除外"
      - "矢印はより速くレンダリングします"
      - "必須項目 Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "ツイート KPI 数がアクション可能になります。"
    options:
      - "より大きなフォント"
      - "比較と方向"
      - "境界線"
      - "通貨記号"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "スローダッシュボードの最大のレバーは通常:"
    options:
      - "チャートの種類"
      - "1つのクエリを共有できるウィジェットを統合"
      - "フェアーカラー"
      - "より速いブラウザ"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "スクロールが必要なダッシュボード上のテーブル:"
    options:
      - "よい情報密度"
      - "ダッシュボードウィジェットであることを停止し、データエクスポートになります"
      - "フォントを大きくする"
      - "間違ったソート順"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "ダッシュボードを共有する前の最後のチェックは次のとおりです。"
    options:
      - "タイトルのスペルチェック"
      - "制限されたユーザーとしてそれを開いたり、独立して何かに対して見出しを一致させます"
      - "PDFへのエクスポート"
      - "ウィジェットを追加"
    answer: 1
    topic: "designing-dashboards"
---

アナリティクスダッシュボードのデザインドメインの質問を練習 CRM Analytics そして、 Einstein Discovery コンサルタント試験
