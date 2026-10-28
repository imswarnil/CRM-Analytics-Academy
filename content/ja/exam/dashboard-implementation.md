---
title: "アナリティクスダッシュボードの実装 — 実践的な質問"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL'差分を定義する SQL つまり:"
    options:
      - "それは総計機能を持っていません"
      - "ストリームトランスフォーメーションです。各ステートメントは前の結果を変換するので、ステートメントオーダーはクエリプランです。"
      - "フィルターができません"
      - "1つのデータセットのみを読み込む"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "最も安い方法を学ぶ SAQL は:"
    options:
      - "機能参照の端を端に読むこと"
      - "クリックしてチャートをビルドし、既に知っている回答に対して生成されたクエリを読み込みます"
      - "ゼロからクエリを書く"
      - "フォーラムから例をコピーする"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "方法 SAQL 最も重要なことは、 SQLお問い合わせ"
    options:
      - "フィルターができません"
      - "ストリームトランスフォーメーションです。各ステートメントは前のものの結果を変換するので、ORDER ステートメントはクエリプランです。"
      - "それは総計機能を持っていません"
      - "1つのデータセットのみで動作します。"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "各セグメントの総収益のシェアを望む。 なぜこの厄介なクリックだけで?"
    options:
      - "パーセンテージはサポートされていません"
      - "すべての行の集計と比較して各行を必要とします。1つのクエリで集計の2つのレベル"
      - "セグメントはグループ化できません"
      - "それは厄介ではありません"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "フィルターが属する場所 SAQL 最高のパフォーマンスのためのクエリ?"
    options:
      - "最後に、グループ化後"
      - "できるだけ早い段階では、以下の文でデータが流れにくい"
      - "問題ない"
      - "フォレスト内"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "使用するラインアップ穀物でデータセットで取引をカウントするには:"
    options:
      - "カウント()"
      - "ユニーク('Opportunity') お問い合わせ"
      - "合計('Amount')"
      - "avg()"
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "sum() は 40% の null を返すカラムを上回っています。"
    options:
      - "メニュー"
      - "非null行の合計は、残りがスキップされたことを示すものではありません。"
      - "ゼロ"
      - "エラー"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "2つの集計を分ける安全な方法は?"
    options:
      - "per-row比率のavg"
      - "sum(numerator) / sum(denominator)、ゼロデノミネーターからガード"
      - "どちらが等しいか"
      - "部門はサポートされていません"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "フィルターが最高の性能のために行くべき場所か。"
    options:
      - "グループの後で、従ってろ過されます"
      - "できるだけ早い段階では、それ以降にすべての行が流れます。"
      - "終了時"
      - "注文は違いをしません"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` また取除きます:"
    options:
      - "その他"
      - "Stage が null である全ての行"
      - "クローズドウォン行"
      - "他のデータセットからの列"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "石炭を使用してゼロでnullを交換する:"
    options:
      - "常に安全"
      - "クレーム — 'unknown' を 'none' に変換し、平均値を変更し、間違っている"
      - "集計前に必須"
      - "ディスプレイの選択だけ"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "必要な会社の収益の各セグメントのシェアを計算するには:"
    options:
      - "セグメント別グループ"
      - "すべての行の集計と比較して、各グループの値 — 集計の2つのレベル"
      - "別のダッシュボード"
      - "デュアル軸"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "ウィンドウの実行された合計は、以下のとおりです。"
    options:
      - "それはより速いです"
      - "注文した行を1つの値にまとめるのではなく、"
      - "null を無視する"
      - "2つのデータセットが必要です"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "各地域のランキングの担当者は、ウィンドウが次のものでなければなりません。"
    options:
      - "すべての行に"
      - "地域別なので、各地域は独立して1からランク付けされます。"
      - "ソートのみ"
      - "担当者によるグループ化"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "10つのダッシュボードで2つのデータセットを組み合わせるメトリックが必要です。 組み合わせはどこにありますか?"
    options:
      - "各ウィジェットで SAQL"
      - "レシピでは、すべての10が建設に合意し、一度に計算されます。"
      - "スプレッドシート"
      - "ダッシュボード JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "異なる穀物で2つのストリームをクエリで生成します。"
    options:
      - "エラー"
      - "同じファンアウトは、レシピで取得します。 — マッチした行間で繰り返される測定"
      - "正しい結果は自動的に"
      - "数値のみ"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "2 ストリーム クエリのよい使用は次のとおりです。"
    options:
      - "企業収益の決定"
      - "アドホック比較 — 単一のダッシュボードで、小さなターゲットテーブルに対して実際のところ"
      - "すべての参加"
      - "レシピ層の交換"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "クエリは、複数のクリーンで高すぎる番号を返します。 疑わしいことは:"
    options:
      - "フィルター"
      - "行を多岐に渡るコンビネーション、その後の計測が要する"
      - "注文ステートメント"
      - "ヌードル"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "間違ったものを返すクエリを理解する最速の方法は:"
    options:
      - "ゼロから書き換える"
      - "読み込みに戻り、一度に 1 つのステートメントを追加し、各行のカウントを確認"
      - "フィルターを追加"
      - "異なるチャートタイプに切り替える"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "データ変更なしで実行間で変更する数値は通常意味しません:"
    options:
      - "キャッシュバグ"
      - "相対的な日付範囲、または明示的な順序無しの窓"
      - "権限の問題"
      - "レンダリングの問題"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL ステートメントの実行:"
    options:
      - "楽観者から選ばれた注文"
      - "記述された順序で — それぞれは前の結果を変えます"
      - "並列で"
      - "アルファベット順"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "フィルターは属します:"
    options:
      - "グループ終了後"
      - "早めに"
      - "インサイドフォアチ"
      - "終了時"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "ラインワームの穀物では、取引は次のようにカウントされます。"
    options:
      - "カウント()"
      - "ユニーク('Opportunity') お問い合わせ"
      - "合計('Amount')"
      - "メディア()"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "sum() は 40% の null を返すカラムを上回っています。"
    options:
      - "メニュー"
      - "非null行の合計、残りの部分がスキップされていない"
      - "ゼロ"
      - "エラー"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "重み付き割引率は次のとおりです。"
    options:
      - "avg('DiscountPct') は、"
      - "sum('Discount') / sum('ListTotal'), ゼロからガード"
      - "メディアン('DiscountPct')"
      - "最高('DiscountPct')"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` また取除きます:"
    options:
      - "その他"
      - "ステージがnullの列"
      - "クローズドウォン行"
      - "他のデータセットからの列"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "各地域のランキング担当者は窓を必要とします:"
    options:
      - "すべての行に"
      - "地域別"
      - "注文のみ"
      - "担当者によるグループ化"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "明示的な注文無しの実行総は次のとおりです。"
    options:
      - "良い — 注文は推測されます"
      - "次のリフレッシュと静かに異なるまで安定しているバグ"
      - "書くことの不可能"
      - "自動的に日付によって分類される"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "2つのデータセットは、10つのダッシュボードに組み合わせる必要があります。 所属:"
    options:
      - "各ウィジェットで SAQL"
      - "レシピで"
      - "ダッシュボード JSON"
      - "スプレッドシート"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "クリーンな複数の提案で高い合計:"
    options:
      - "null の問題"
      - "列の乗算、それの後で要約される親測定を用いる"
      - "フィルター"
      - "レンダリングの問題"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "同じデータセットに組み込まれた2つのウィジェット。 デフォルトでは、いずれかをクリック:"
    options:
      - "他に何もしない"
      - "他をフィルタリング — 同じデータセットウィジェットが互いに自動的に直面する"
      - "結合が必要"
      - "新しいレンズを開く"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "主な理由の相互作用は:"
    options:
      - "それは印象的です"
      - "ほとんどの人はレンズを組み立てることはありませんが、ほぼ全員がバーをクリックするだけです。インタラクションは、ダッシュボードが期待していない質問に答える方法です。"
      - "それは性能を改善します"
      - "共有のために必要です"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "同じデータセットに2つのウィジェットが組み込まれています。 デフォルトでは、いずれかをクリック:"
    options:
      - "他に何もしない"
      - "他のフィルタを自動的にフィルタリングする"
      - "新しいレンズを開く"
      - "相互作用する結合を要求します"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "なぜあなたは意図的に1つのウィジェットのためにオフに直面しているか?"
    options:
      - "性能向上のため"
      - "それは参照であるので — 他のすべてのフィルターの間に固定されなければならない会社の合計、従って読者は全体に対する部分を見ることができます"
      - "顔はいつも間違っています"
      - "データを隠す"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "1つの領域にビューアフィルタとウィジェットが空白になります。 不快な原因は次のとおりです。"
    options:
      - "壊れたクエリ"
      - "ウィジェットのデータセットは、その領域の行を持たない — 修正ではなくラベルを必要とする正直な空の状態"
      - "顔が無効になっています"
      - "セキュリティの述語"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "ダッシュボードは、すべての地域とすべての時間を表示する開きます。 地方のディレクターにとっては、"
    options:
      - "最高の柔軟性"
      - "画面が関連したことを言う前に、同じ3つが毎晩クリックします"
      - "より速いローディング"
      - "より良いセキュリティ"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "ビューアがセグメントをクリックすると、画面がフィルタリングされます。 提供する最も重要なことは:"
    options:
      - "アニメーション"
      - "現在の選択の可視表示とそれをクリアする明らかな方法"
      - "ツールチップ"
      - "2番目のチャート"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "保存されたビューは:"
    options:
      - "ダッシュボードのコピー"
      - "記憶された状態 — フィルターと選択 — そのため、誰かが再クリックせずにスライスに戻る"
      - "スケジュールされた電子メール"
      - "許可設定"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "要約ダッシュボードから詳細までリンクすると、次のようになります。"
    options:
      - "要約の構築を避ける"
      - "細部が1つであるので、分かち合いを保って下さい"
      - "セキュリティをスキップ"
      - "クエリ性能を向上させる"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "例外テーブルからのドリルのための最も有用な目的地は通常です。"
    options:
      - "異なるダッシュボードのホーム状態"
      - "ふりがな Salesforce その行のレコード, 実際に仕事が起こる場所"
      - "PDFエクスポート"
      - "データセット"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "フィルタされていない詳細ダッシュボードに埋め込むドリルは次のとおりです。"
    options:
      - "メニュー"
      - "壊れたドリル — 全体のポイントは、クリックしたコンテキストを継承する"
      - "より適用範囲が広い"
      - "ファスナー"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "同じデータセットで2つのウィジェット。 ワンクリック:"
    options:
      - "何もしない"
      - "デフォルトで他をフィルタリング"
      - "結合が必要"
      - "レンズを開ける"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "ウィジェットをメインに切り替えます。"
    options:
      - "遅い"
      - "他のすべてのフィルターがすべてある間に固定されるべき参照です"
      - "テーブルです。"
      - "タイトルはありません"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "ウィジェットの半分はフィルタに応答し、半分はしません。 これは:"
    options:
      - "ノーマル"
      - "危険な状態 — すべてのウィジェットが個別に正しいときに画面が偽物です"
      - "キャッシュの問題"
      - "ライセンス制限"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "ダッシュボードを開く必要があります:"
    options:
      - "ろ過されていない、すべてを示す"
      - "一般的な場合 — 現在の期間、ビューアのスコープ、ソート、制限"
      - "空白の状態"
      - "昨年度"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "毎月の現在の部分を満たす:"
    options:
      - "最も現在のビューです"
      - "それが除外またはマークされていない限り毎月明らかな低下を製造"
      - "精度の向上"
      - "効果がない"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "フィルタされたダッシュボードは、その選択を次の理由で示さなければなりません。"
    options:
      - "tidier を見る"
      - "スクリーンショット化され、フィルタはイメージに見えない"
      - "顔面に必要です"
      - "クエリを高速化"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "保存されたビューは、以下のような価値があります。"
    options:
      - "管理者"
      - "スライスが常に同じである、そうでなければ毎日それを再クリックする"
      - "モバイルユーザーのみ"
      - "輸出入"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "ろ過されていない目的地に着陸するドリルダウン:"
    options:
      - "より多くの柔軟性を与える"
      - "練習中に壊れている - 一度クリックして放棄される"
      - "読み込み速度が速い"
      - "標準パターンは"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "対面と結合の違いは次のとおりです。"
    options:
      - "ありません"
      - "Facetingは同じデータセットウィジェット間で自動です。バインディングは、構成する明示的な配線です"
      - "結合はより速いです"
      - "面取りは要求します SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "任意のダッシュボードに追加するための最良の最初の結合は次のとおりです。"
    options:
      - "条件付きウィジェットの可視性"
      - "現在の選択を述べる動的タイトル"
      - "ネストされたフィルタチェーン"
      - "クロスデータセットファセット"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "結合とは何ですか?"
    options:
      - "データセット間の参加"
      - "1つのウィジェットの状態は、別のウィジェットのクエリや表示を供給します"
      - "セキュリティ設定"
      - "チャートタイプ"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "結合の最もよい最初の使用は通常です:"
    options:
      - "条件付きウィジェットの可視性"
      - "現在の選択を述べる動的タイトル"
      - "ネスト依存フィルタ"
      - "クロスデータセットフェース"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "多岐にわたるダッシュボードの主な長期費用は次のとおりです。"
    options:
      - "クエリパフォーマンス"
      - "誰もそれを安全に変えることができない - 読みにくいウィジェットの設定でロジックが生きます。"
      - "ライセンス消費量"
      - "ブラウザのメモリ"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "選択の結合の最も重要な端の箱はあります:"
    options:
      - "複数の選択"
      - "何も選択されていない - ソースが空の場合、境界ウィジェットが何をするか"
      - "スロークエリ"
      - "カラーコントラスト"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "依存フィルタ(レップリストを狭くするレギオン)は、"
    options:
      - "常に"
      - "従属リストは、それが実質のコストであるスキャンするのに十分な長さです - フォアティの担当者、4"
      - "決してない"
      - "管理者専用"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "ダイナミックなタイトルの結合は、主に以下のような理由で価値があります。"
    options:
      - "それは動的に見える"
      - "ダッシュボードのフィルタ状態は、コンテキストなしでメッセージにスクリーンショットされたままに存続します"
      - "それは性能を改善します"
      - "顔面に必要です"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "結果の結合は読みます:"
    options:
      - "視聴者が選択したもの"
      - "別のウィジェットのクエリで返される値"
      - "データセットのメタデータ"
      - "ふりがな URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "結果バインディングのパフォーマンスコストは、次のとおりです。"
    options:
      - "データ量を倍増"
      - "実行順序を作成する — 依存ウィジェットは、ソースが返されるまで起動できません"
      - "それはキャッシュを無効にします"
      - "ありません"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "結果バインディングをデバッグするのは、選択バインディングよりも困難です。"
    options:
      - "構文は異なる"
      - "入力は画面に見えない - 選択を見るのではなくクエリを追跡する必要があります"
      - "検査できません。"
      - "管理者権限が必要です"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "A → B → C のチェーン結合の主な危険性は次のとおりです。"
    options:
      - "データ精度"
      - "シーケンシャルの実行と依存性が見えないので、見えない理由でAブレイクCに変更"
      - "ライセンスコスト"
      - "ブラウザの互換性"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "ダッシュボードがあまりにも多くのバインディングを持っている実用的な信号は次のとおりです。"
    options:
      - "ファイルサイズ"
      - "著者以外の誰かが安全に変更することはできませんので、代わりに新しいダッシュボードを構築します"
      - "ウィジェットの数"
      - "単独でレンダリングスロー"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "境界ダッシュボードを維持できる最も安いことは以下です。"
    options:
      - "ウィジェット"
      - "結合ごとの記述の1ライン — 何を供給するか、なぜか"
      - "より多くの色"
      - "問い合わせのための命名規則"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "バインディングは、次の理由から異なる:"
    options:
      - "それはより速いです"
      - "同じデータセットウィジェット間でフェーティングが自動で設定する、明示的な配線です。"
      - "お問い合わせ SAQL"
      - "orgs で動作する"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "すべてのダッシュボードで最高の最初の結合は次のとおりです。"
    options:
      - "条件付き可視性"
      - "選択を運ぶ動的タイトル"
      - "ネストされたフィルタチェーン"
      - "測定トグル"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "結果の結合は読みます:"
    options:
      - "視聴者の選択"
      - "別のクエリを返す値"
      - "データセットメタデータ"
      - "サイトマップ URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "結果のバインディングにより、ダッシュボードは遅くなります。"
    options:
      - "データ量を増やす"
      - "連続実行 — 依存ウィジェットがソースを待ちます"
      - "無効なキャッシュ"
      - "完全なリフレッシュを強制する"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "常に定義しなければならないエッジケースは次のとおりです。"
    options:
      - "多くの行から"
      - "選択なし"
      - "遅いネットワーク"
      - "小さな画面"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "以前に選択した担当者がスコープでなくなった依存フィルタは、次のようになります。"
    options:
      - "その担当者にフィルタリングし続ける"
      - "階段選択をクリア"
      - "エラーを表示"
      - "ページのリロード"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "5つのウィジェットが1つのフィルターに結合し、チェーンで3つの境界を越えます。 メンテナンス性は?"
    options:
      - "チェーン — 少ないバインディング"
      - "5 - パントは予測可能で、深さはない"
      - "それらは等しいです"
      - "メンテナンス可能"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "すべての負荷のバインディングによって計算される会社のメトリックは、代わりにすべきです。"
    options:
      - "ブラウザでキャッシュされる"
      - "レシピに一度計算し、フィールドとして保存される"
      - "定数としてタイプされる"
      - "削除する"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "ダッシュボードを編集するための最良の理由 JSON 直接:"
    options:
      - "日常作業のビルダーよりも早く"
      - "ビルダーを一括して繰り返し変更すると、一度に1つのウィジェットが作成されます"
      - "隠しチャートタイプのロック解除"
      - "セキュリティを迂回する"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "ダッシュボードの JSON レビューには次のようなものがあります:"
    options:
      - "ブラウザで表示"
      - "テキスト — diffs なので、会議で説明するのではなく変更が検討可能です。"
      - "ダッシュボードよりも小さい"
      - "データが含まれています"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "ダッシュボードのドキュメントでは、'step' は次のようになります。"
    options:
      - "ウィザードページ"
      - "クエリ定義 — ウィジェットが描画するデータ"
      - "レイアウトのブレイクポイント"
      - "権限"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "複数のウィジェットは、異なるスライスされた同じ測定を表示します。 理想的には:"
    options:
      - "それぞれ独自のステップを定義する"
      - "異なるクエリの数がロード時間の主なレバーであるため、1つのステップを共有します"
      - "別のデータセットを使用する"
      - "1つのウィジェットにマージされる"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "ウィジェットとレイアウトは別です。"
    options:
      - "歴史事故"
      - "ウィジェットは描かれているものです。レイアウトは座っている場所です。そのため、1つのウィジェットは異なる画面サイズで異なる配置することができます。"
      - "レイアウトはデータを格納します"
      - "ウィジェットは配置できません"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "手書きのステップ SAQL クリックされた定義ではなく:"
    options:
      - "ログイン"
      - "ビルダーが往復するのは、ファインで難しく、インターフェイスは視覚的に編集できない"
      - "ファスナー"
      - "自動的に共有される"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "静的なステップはのために使用されます:"
    options:
      - "クエリ結果のキャッシュ"
      - "値の固定リスト — オプションをトグル、しきい値 — データセットからクライドされていない"
      - "セキュリティルール"
      - "レイアウト定義"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "ダッシュボードの負荷時間の主なレバーは、目に見えます JSONは:"
    options:
      - "ウィジェットの数"
      - "異なるステップの数 — クエリを共有できるウィジェットが、それぞれ独自の定義"
      - "ファイルサイズ"
      - "レイアウトの数"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "ウィジェットは、デスクトップ上で右に見えるし、携帯電話で間違っている. 問題はあります:"
    options:
      - "ステップ"
      - "レイアウト — ウィジェットとは別に、ブレークポイントごとに位置とサイズが定義されます。"
      - "データセット"
      - "セキュリティ述語"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "ウィジェットのプロパティをテキストとして編集することは最も便利です:"
    options:
      - "新しいダッシュボードの構築"
      - "一度に多くのウィジェット間で同じフォーマットの変更を適用"
      - "データセットの変更"
      - "セキュリティの追加"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "ダッシュボードを手動で編集する前に、次の操作を行います。"
    options:
      - "キャッシュをクリアする"
      - "コピーをエクスポート — undo のストーリーは、事前に保存したものです"
      - "すべての視聴者に通知する"
      - "スケジュールを無効にする"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "ダッシュボードを維持するための主要なガバナンスのメリット JSON リポジトリは:"
    options:
      - "より速いローディング"
      - "変更はミーティングの文の代わりにレビュー可能な差分になります"
      - "より良いセキュリティ"
      - "小さいファイルサイズ"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "ハンド編集後、往復テストは次のようになります。"
    options:
      - "データのチェックが正しい"
      - "ビルダーにリロードして、まだ開いているか確認し、視覚的に編集します。"
      - "レシピの実行"
      - "選択をクリアする"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "ダッシュボードのドキュメントのステップは次のとおりです。"
    options:
      - "ウィザードページ"
      - "名前付きクエリ定義"
      - "レイアウトのブレイクポイント"
      - "共有ルール"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "ウィジェットは、データを参照します。"
    options:
      - "保持する SAQL インライン"
      - "一歩を踏み出す"
      - "データセット ID でのポインティング"
      - "レイアウトから継承"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "ダッシュボードは電話のみで誤って見えます。 見て下さい:"
    options:
      - "ステップ"
      - "レイアウト"
      - "データセット"
      - "述語"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "12人のウィジェットのための11のステップは提案します:"
    options:
      - "よい分離"
      - "ほとんど何も共有されず、画面は11往復をしています"
      - "破損したファイル"
      - "ウィジェット数"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "継承されたダッシュボードですべてのバインディングを見つける最速の方法は次のとおりです。"
    options:
      - "各ウィジェットパネルを開く"
      - "検索する JSON 結合の構文のため"
      - "著者に依頼する"
      - "データセットをチェック"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "手書きの前に、あなたはいつも次のものでなければなりません:"
    options:
      - "明確な選択"
      - "コピーをエクスポートする"
      - "スケジュールの変更"
      - "視聴者の通知"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "往復テストでは、以下をチェックします。"
    options:
      - "データの正確性"
      - "ビルダーは編集後にダッシュボードを開いて視覚的に編集することができます"
      - "ファイルが小さい"
      - "セキュリティは適用します"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "テキストではなく、ビルダーに一番左に変わりますか?"
    options:
      - "ウィジェット間でフィールドの名前を変更"
      - "ウィジェットの追加または削除は、すべてのレイアウトで一貫する必要があるためです。"
      - "数値形式を変更する"
      - "タイトルの編集"
    answer: 1
    topic: "dashboard-json"
---

アナリティクスダッシュボードの実装ドメインに関する質問 CRM Analytics そして、 Einstein Discovery コンサルタント試験
