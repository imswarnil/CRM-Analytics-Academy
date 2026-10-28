---
title: "データレイヤー — 実践的な質問"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "単一の最も強い引数は何ですか? CRM Analytics 汎用BIツールよりも?"
    options:
      - "そのチャートがより良く見える"
      - "継承する Salesforce's 共有とセキュリティモデル、つまり誰が既に解決しているのか"
      - "それは安いです"
      - "読むことができる唯一のツールです。 Salesforce データデータ"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "データセット CRM Analytics として最もよい記述されます:"
    options:
      - "ライブビュー Salesforce オブジェクト"
      - "スケジュールで材料化、柱スナップショット再構築"
      - "保存レポート"
      - "ツイート SQL あなたが書くことができるテーブル"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "VP は、数秒ごとにコールセンターのキュー深さを更新する画面を望んでいます。 です。 CRM Analytics 正しいツール?"
    options:
      - "はい、速い十分なレシピのスケジュールと"
      - "いいえ — ストリームではなく、スケジュールでリフレッシュします。これは、分析ではなく、運用上の必要性です。"
      - "はい、使用すれば Einstein Discovery"
      - "プラスライセンスのみ"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "どのレイヤーが「修飾されたパイプライン」の定義を所有していますか?"
    options:
      - "デザインレイヤーは、番号が表示される場所だから"
      - "データレイヤーは、メトリックごとに定義されたメトリックがメトリックの2つのダッシュボードであるため、"
      - "インテリジェンスレイヤー"
      - "どのチームが最初に尋ねる"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "ダッシュボードが遅くなります。 どの層が最初に疑われるべきか。"
    options:
      - "デザインレイヤー — あまりにも多くのウィジェット"
      - "データレイヤー — 数百万行を集計するために、すべてのウィジェットを強制する間違った穀物でデータセット"
      - "インテリジェンスレイヤー"
      - "ネットワーク"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery 78%の正確なモデルを生成します。 インテリジェントレイヤーが設計レイヤーを借りているのは何ですか?"
    options:
      - "予測のみ"
      - "予測、自信、トップファクター — 理由のない得点は行動できません"
      - "トレーニングデータ"
      - "何も;正確さは十分です"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "データセットの穀物はどういう意味ですか?"
    options:
      - "保有するデータ量"
      - "1列が正確に表すもの"
      - "どのくらいの頻度でリフレッシュ"
      - "どのフィールドが対策されているか"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "機会(608行)に参加して、機会 製品(1,192行)と合計金額に。 何が起こるか?"
    options:
      - "何も - 要約が正しい"
      - "数量は製品ラインごとに1回カウントされますので、総収益は膨脹します。ここには3倍近くです。"
      - "参加失敗"
      - "マッチした行のみがまとめられているので、収益が落ちる"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "データセットが歴史を保持する理由 Salesforce オブジェクトはしませんか?"
    options:
      - "Salesforce 古いレコードを削除"
      - "各実行は、その瞬間に状態のスナップショットを追加できますが、オブジェクトは現在の値のみを保持します。"
      - "データセットはバックアップされます"
      - "それはない"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "データ同期(レプリケーション)とは?"
    options:
      - "データを書き戻す Salesforce"
      - "選択したオブジェクトとフィールドの現在のローカルコピーを保持するので、各実行のソースを打つ代わりにレシピが読み込まれます"
      - "スケジューリングダッシュボード"
      - "データセットの暗号化"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "レシピは失敗します。 どこで見ますか?"
    options:
      - "ダッシュボードの検査員"
      - "Data Manager → モニター"
      - "セットアップ → アナリティクス → 設定"
      - "dataset のフィールド属性"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "なぜインテグレーションユーザはこんなに問題がありますか?"
    options:
      - "ダッシュボードを所有しています"
      - "同期は、そのユーザーとして実行されます。そのため、任意のオブジェクトまたはフィールドは、単に到達することができません。ダッシュボードにエラーはありません。"
      - "ライセンスの支払い"
      - "レシピのスケジュール"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "'app' で CRM Analytics は:"
    options:
      - "インストールしたアプリケーション"
      - "データセット、レンズ、ダッシュボード、共有設定のコンテナ"
      - "モバイル体験"
      - "管理されたパッケージ"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "レンズとダッシュボードの違いは何ですか?"
    options:
      - "Lenses 保存できません"
      - "レンズは1つのデータセットを探求し、使い捨てのワークスペースです。ダッシュボードは多くのクエリを組み立て、それらを一緒に直面し、他の人のために構築されています"
      - "ダッシュボードは使用できません SAQL"
      - "なし"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "お問い合わせ Einstein Discovery「ストーリー」は:"
    options:
      - "デプロイされたモデル"
      - "結果と相関するものの解析は、モデルとして展開される可能性があります。"
      - "ダッシュボードテンプレート"
      - "物語的なテキストウィジェット"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "ステークホルダーは「リアルタイムで」を更新するダッシュボードを要求します。 正しい最初の動きは何ですか?"
    options:
      - "レシピを毎時スケジュールし、リアルタイムに呼び出します"
      - "それが役に立たない前に、その決定が何であるかを尋ねる - 回答は通常、時間内で測定されます"
      - "リクエストを拒否する"
      - "使用条件 Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "会社のデータの大部分は倉庫にあります。 Salesforce アカウントと機会のみを保持します。 その提案は何ですか?"
    options:
      - "使用条件 CRM Analytics 倉庫を同期"
      - "あなたは、添付CRMで倉庫プロジェクトを構築しています - 倉庫上のBIツールは、おそらくより良いサービスを提供するだろう"
      - "使用条件 Salesforce レポート"
      - "使用条件 Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "なぜこのダッシュボードは単一の総ALR番号で開きますか?"
    options:
      - "トップにスペースを埋めるために"
      - "そのため、他の何も読み取るビューアは、画面が画面の見出しで残っています"
      - "ウィジェット数が最も速くロードされるため"
      - "お問い合わせ Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "セグメントバーをクリックすると、他の2つのウィジェットがフィルタリングされます。 なぜ?"
    options:
      - "結合が形成されました"
      - "デフォルトで同じデータセットに組み込まれたウィジェットは、それぞれ別のデータセットに直面しています"
      - "テーブルはチャートの子です"
      - "常に手動でオンにする必要があります"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "最上位の表は、140行以上ではなく10行を示しています。 最高の理由は:"
    options:
      - "パフォーマンス"
      - "質問は集中についてであり、テーブルは誰もダッシュボードではなく、一目で取り込むことができます"
      - "テーブルは10列まで"
      - "小さいアカウントを隠すために"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "データセット CRM Analytics は:"
    options:
      - "ライブビュー Salesforce オブジェクト"
      - "スケジュールで材料化、柱スナップショット再構築"
      - "保存される Salesforce レポート"
      - "書き込み可能 SQL テーブル"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "最も強力な引数 CRM Analytics 汎用BIツールは:"
    options:
      - "より良いチャートタイプ"
      - "それを再構築するのではなく、orgの共有とセキュリティモデルを継承"
      - "ライセンスコストを下げる"
      - "読む唯一の方法です Salesforce データデータ"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "ダッシュボード上の総収益は、財務レポートを正確に倍増します。 おそらく原因:"
    options:
      - "セキュリティ述語"
      - "子行間で繰り返される親の計測 — の結合"
      - "データセットが更新されていない"
      - "通貨のフォーマット"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "ユーザは、彼らが知っていることが欠落しているレコードを報告します。 FIRSTはどこにありますか?"
    options:
      - "ダッシュボードのウィジェットのクエリ"
      - "インテグレーションユーザーのアクセス、セキュリティ述語"
      - "チャートタイプ"
      - "アプリの色テーマ"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "どのレイヤーが「修飾されたパイプライン」のようなメトリックの定義を所有していますか?"
    options:
      - "デザイン — それはそこに表示されます"
      - "データ — ダッシュボードごとに定義されるメトリックは 1 つの 2 つのダッシュボードで、"
      - "インフォメーション"
      - "どのチームが最初に尋ねる"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "データ同期とは?"
    options:
      - "分析結果を書く Salesforce"
      - "選択したオブジェクトとフィールドの現在のローカルコピーを保持しているため、レシピは各実行のソースをヒットしません"
      - "ダッシュボードメールのスケジューリング"
      - "残りでデータを暗号化する"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "'app' で CRM Analytics は:"
    options:
      - "インストールされたパッケージ"
      - "共有設定を行うデータセット、レンズ、ダッシュボード用のコンテナ"
      - "モバイルクライアント"
      - "ダッシュボードテンプレート"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "レシピは毎晩正常に実行されますが、データは常に古いです。 最も可能性が高い原因は:"
    options:
      - "データセットは破損しています"
      - "レシピは、データの同期が終了する前にスケジュールされます"
      - "顔が無効になっています"
      - "インテグレーションユーザーがアクセスを欠く"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "stakeholderはライブコールキューのために数秒毎に更新するスクリーンを必要とします。 お問い合わせ"
    options:
      - "できるだけ頻繁にレシピをスケジュールする"
      - "これは、分析的なものではなく、操作上の要件であり、ポイントを Salesforce ページまたは目的構築ツール"
      - "使用条件 Einstein Discovery"
      - "ビルドしてリフレッシュボタンを追加"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery 機会をスコアするモデルを展開します。 スコアで発送しなければならないこと"
    options:
      - "トレーニングデータセット"
      - "背後にあるトップファクター — 悪い確率は、演技には何もありません"
      - "ふりがな SAQL お問い合わせ"
      - "その他"
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "これらのどれがデータがデータにならない CRM Analytics データセット?"
    options:
      - "ツイート CSV アップロード"
      - "データ同期 Salesforce オブジェクト, レシピによって変換"
      - "ダッシュボードウィジェットで発行されたライブクエリ"
      - "倉庫への外部接続、同期および変換"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "レシピを作成する前に、あなたは状態にすることができる必要があります:"
    options:
      - "使用するチャートタイプ"
      - "出力データセットの1列が正確に何を表すか"
      - "ダッシュボードの色テーマ"
      - "利用者の何人かが表示されるか"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "ソースのそれぞれの実行からではなく、レシピが同期したデータを読んでいるのはなぜですか?"
    options:
      - "レシピは読むことができません Salesforce 直接"
      - "ローカルコピーは高速で、すべての実行上の記録のシステムに槌で打ちません"
      - "同期データはより正確です"
      - "それはライセンス要件です"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "レシピは夜に成功しますが、昨日のデータは常に表示されます。 不快な原因は次のとおりです。"
    options:
      - "破損したデータセット"
      - "レシピは、それが終了に依存同期する前にスケジュールされます"
      - "ダッシュボードキャッシュ"
      - "インテグレーションユーザーがアクセスを欠く"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "次の四半期から月ごとのフィールドの履歴が必要になります。 同期を始めるには?"
    options:
      - "次の四半期、それが必要なとき"
      - "今 — スナップショットは、時刻に同期されたものだけを覚えることができ、現在の状態を保持しているオブジェクトから履歴を埋め戻すことはできません。"
      - "問題ない"
      - "レシピが存在する後だけ"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "テキストとして読み込まれた CloseDate フィールド。 何が壊れますか?"
    options:
      - "テキストの日付が正常に動作しない"
      - "日付フィルタ、月グループ化とトレンドライン — そして、修正はリロードを必要とします"
      - "記録ページのみ"
      - "データセットは保存しません"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "数値表示 ID を寸法に強制する理由"
    options:
      - "スペースを節約するため"
      - "製品がそれらをまとめるために提供し、最終的に誰かが受け入れる措置としてタイプされるので"
      - "お問い合わせ"
      - "フィルタ可能にする"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "アップロードしたデータセットは608の代わりに607行を示しています。 おそらく:"
    options:
      - "許可の問題"
      - "ヘッダ・ローの問題 CSV パセア"
      - "セキュリティの述語"
      - "ノーマル・ラウンド"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "バケット境界がどこから来るべきか?"
    options:
      - "レンジの3分の1"
      - "ビジネス — 誰かが何かを別のものにするポイント"
      - "データセットの量子、常に"
      - "チャートのカラースケール"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "レシピのではなく、各ダッシュボードでバケットがつながります。"
    options:
      - "より良い柔軟性"
      - "'Large' は、さまざまな画面で異なることを意味しています。"
      - "迅速な問い合わせ"
      - "より小さなデータセット"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "正確に境界線上の値 — 正確に 55% の活用 — は、"
    options:
      - "左からチャンス"
      - "誰かが最終的にそれを照会するので、明示的に、書面による規則によって割り当てられる"
      - "除外される"
      - "ラウンドオフ"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "どのノードタイプがデータが流れているのか?"
    options:
      - "フィルター"
      - "参加と集約"
      - "フォーム"
      - "出力"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "各アカウント行に添付されたアカウントあたりの機会の数が必要です。 どのノード?"
    options:
      - "フォーム"
      - "アカウントがグループ化した機会を集計し、アカウントへの参加"
      - "フィルター"
      - "トランスフォーム"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "なぜ大きなレシピを複数の小さなレシピに分割するのですか?"
    options:
      - "レシピにはハードノードの制限があります"
      - "書き込みをしなかった人には、50 ノードのレシピが読められず、失敗はローカライズを停止します。"
      - "より小さいレシピはより速く実行します"
      - "スケジューリングが必要です"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "割引料金の平均が通常間違っているのはなぜですか?"
    options:
      - "ラウンドリング"
      - "$ 5,000 は $ 2M と同じ扱います — 正しい数字は合計リスト値で合計割引を分割します"
      - "割引は平均できません"
      - "フィールドはテキスト"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "10つのダッシュボードで必要な比率は計算されるべきです:"
    options:
      - "各ウィジェットでは、各チームが調整できる"
      - "一度レシピで, ので、すべての 10 構造によって同意します"
      - "スプレッドシート"
      - "によって Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "レシピではなく、ダッシュボードに本物的に属する計算は?"
    options:
      - "企業全体のメトリック定義"
      - "ビューアーの現在のフィルタ選択に依存する1"
      - "通貨変換"
      - "バケットセグメント"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "空白の量をゼロで満たす:"
    options:
      - "常に正しい"
      - "クレーム — 取引は何も価値がないと主張しています。これは、その上で構築されたすべての平均値を変更します。"
      - "集計前に必須"
      - "ディスプレイのみの選択"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "クローズドケースの44%のみがCSAT調査です。 CSATの平均値は:"
    options:
      - "ログイン"
      - "正しいが、顧客ではなく、回答者を記述するので、そのほかの応答率で出荷する"
      - "免責事項"
      - "不足しているスコアを妨げることによって改善される"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "「経済的買い手」はブランクの予測が失われています。 最も可能性が高い説明は:"
    options:
      - "空白のフィールドは損失を引き起こします"
      - "失業した担当者はフィールドを埋めません。ブランクは症状であり、原因ではありません。"
      - "フィールドが壊れている"
      - "コインシデンス"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "参加後、レベニューを2倍増。 重複は:"
    options:
      - "削除するレコードを複製"
      - "参加アーティファクト — 修正は、重複しないステップではなく、参加です"
      - "データ入力問題"
      - "nulls によるキャッシュ"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "arr snapshots のアカウントは 18 回表示されます。 これは:"
    options:
      - "削除する重複"
      - "意図した穀物 — 1 ヶ月あたりの 1 列"
      - "負荷障害"
      - "同期エラー"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "本物の重複を衝突するとき、その行は生き残るべきですか?"
    options:
      - "誰が最初に表示されるか"
      - "明示的なルールによって選ばれたもの - 最近修正、最も完全な、または優先されたソースから"
      - "ランダムな行"
      - "最も低いIDを持つもの"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "ダッシュボードは誤った合計を示しています。 最初はどこで見ますか?"
    options:
      - "ウィジェットのチャート構成"
      - "Data Manager → モニター: 実行, 時, 行数"
      - "アプリ共有設定"
      - "ブラウザコンソール"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "行数が2,800から2,100に下落し、変更がなかった。 おそらく:"
    options:
      - "通常のバリエーション"
      - "上流フィルター、内部の結合、または許可の変更の低下の記録"
      - "チャートの制限"
      - "ラウンドリング"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "レシピで穀物の問題をローカライズするための最速の方法は、次のとおりです。"
    options:
      - "再読み込み SAQL"
      - "ノードのプレビューをクリックして、行のカウントが変化する場所を見て"
      - "レシピを再構築する"
      - "エクスポートする CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "データ同期とは?"
    options:
      - "分析結果を書く Salesforce"
      - "選択したオブジェクトとフィールドの現在のローカルコピーを保持するので、レシピは実行中のソースをヒットしません"
      - "ダッシュボードメールのスケジューリング"
      - "データセットの暗号化"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "レシピは緑色の夜に実行されますが、データは常に古いです。 原因:"
    options:
      - "破損したデータセット"
      - "レシピは完全に依存する同期の前にスケジュールされます"
      - "ダッシュボードキャッシュ"
      - "階段の述語"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "テキストとして読み込まれた CloseDate は、次の操作を防止します。"
    options:
      - "コメントはありません。"
      - "日付フィルター、月分けおよび傾向ライン"
      - "ソート"
      - "参加する"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "数値表示 ID をロード時の寸法に強制する理由"
    options:
      - "スペースを節約するため"
      - "製品がそれらをまとめるために提供し、最終的に誰かが受け入れる措置としてタイプされるので"
      - "お問い合わせ"
      - "フィルタ可能にする"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "バケットの境界は、次のものから来るべきです:"
    options:
      - "レンジの3分の1"
      - "ビジネス — 誰かが何かを別のものにするポイント"
      - "データセットの量子、常に"
      - "チャートパレット"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "レシピのではなく、各ダッシュボードでバケットがつながります。"
    options:
      - "より多くの柔軟性"
      - "'Large' は異なる画面で異なることを意味しています。"
      - "迅速な問い合わせ"
      - "より小さなデータセット"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "「平均割引」は、各料金の平均が間違っているためです。"
    options:
      - "割引は数値ではありません"
      - "それはサイズに関係なくすべての取引を均等に重くします"
      - "数字は除外されます"
      - "異なるカウントが必要です"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "空白の量をゼロで満たす:"
    options:
      - "常に正しい"
      - "クレーム — 取引は何も価値がないと主張し、その上で構築されたすべての平均をドラッグします"
      - "集計前に必須"
      - "ディスプレイのみの選択"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "参加後2倍の収益。 'duplicates' は、"
    options:
      - "削除するレコードを複製"
      - "参加アーティファクト — 修正は、重複しないステップではなく、参加です"
      - "データ入力の問題"
      - "nulls によるキャッシュ"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "レシピの中の間違った番号をローカライズするための最速の方法は、次のとおりです。"
    options:
      - "読書 SAQL"
      - "ノードのプレビューを歩くと、行のカウントが変化する場所を見る"
      - "データセットの再構築"
      - "アプリ共有の確認"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "データセットがどの質問に答えることができるか最も決まりますか。"
    options:
      - "その行数"
      - "その穀物 — 1列が表すもの"
      - "使用されるチャートタイプ"
      - "リフレッシュスケジュール"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "毎月の合計に事前に集計したデータセットは以下のとおりです。"
    options:
      - "厳密により良い — それはより速い"
      - "その穀物の下の質問に答えなかったより速く、そして永久に"
      - "微粉砕された1と等価"
      - "輸出に便利なだけ"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "608のチャンスを1,192の商品ラインに加わりました。 バグですか?"
    options:
      - "はい、参加は誤って設定されます"
      - "いいえ。つまり、ワンツーマンの仲間が何をしているかです。 バグは、親の額を後にまとめています"
      - "はい、行は増加しません"
      - "キーがテキストの場合だけ"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "どの修正でも製品レベルのディテールを維持できますか?"
    options:
      - "参加前のラインアイテムを集計"
      - "線の穀物を保ち、親の額を運ぶのではなく、代わりにLineAmountを要約"
      - "契約ごとの1つのプロダクトにろ過します"
      - "内部の結合の使用"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "合計は、まさに3×あなたが期待するものです。 疑ったことは何ですか?"
    options:
      - "セキュリティの述語"
      - "ファンアウト — それぞれの子行に繰り返される親測定"
      - "階段データセット"
      - "通貨変換"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "疑わしい合計を調べる最善の方法は次のとおりです。"
    options:
      - "チャートの設定をリセットする"
      - "単一のエンティティティに絞り込み、手作業で列を数える"
      - "ダッシュボードを再構築する"
      - "行の限界を増加して下さい"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "データセットの設計の正しい出発点は次のとおりです。"
    options:
      - "利用可能なソーステーブル"
      - "答えなければならない質問、書かれている"
      - "予定されているチャートタイプ"
      - "リフレッシュスケジュール"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "異なる穀物を持つ2つの聴衆を提供するデータセットは通常、次のものでなければなりません。"
    options:
      - "中間穀物での妥協"
      - "2つの出力で1つのレシピから頻繁に2つのデータセットになります"
      - "最高級の穀物を使用"
      - "ビューアごとにフィルタリングされる"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "ダッシュボードではなく、データセット内で適用されるフィルタは、次の場合に右記します。"
    options:
      - "それはより速いです"
      - "除外された行は、このデータセットの回答を問いません"
      - "視聴者が変更したい"
      - "常に"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "account.csv のような参照テーブルは、以下によって特徴付けられます。"
    options:
      - "ほとんどの行を持つ"
      - "集約するのではなく、結合される - 何かをまとめることは通常間違いです"
      - "最も頻繁に変更"
      - "キーを持たない"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "長いフォーマット(メトリックごとの1列)が優先されます。"
    options:
      - "決して変化しないメトリックはいくつかあります"
      - "メトリックは頻繁に追加されていきますが、複数のウィジェットを1つのウィジェットでグラフ化したい"
      - "貯蔵は限られます"
      - "決してない"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "別のデータセットの出力リスクに組み込まれたデータセット:"
    options:
      - "コメントはありません。"
      - "失敗3リンクのバックが端に見えないスケジューリングチェーン"
      - "セキュリティを失う"
      - "列の重複"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "なぜOportunityオブジェクトからパイプライン移動ダッシュボードを単独で構築することはできませんか?"
    options:
      - "オブジェクトが大きすぎる"
      - "現在の値だけを保持する — 過去の月や金額の記録がない"
      - "機会は同期できません"
      - "可能です。"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "作成日ではなく変換日によってリードを生成:"
    options:
      - "より正確な映像"
      - "歪んだもの - 最近のコホーツは不可能で古いものを見て恐ろしい、両方の数字は個別に正しい"
      - "違いなし"
      - "レシピのエラー"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "スナップショットのデータセットは、各実行中の現在の状態を付加します。 今日同期を開始するフィールドはどういう意味ですか?"
    options:
      - "その歴史は自動的に埋め戻されます"
      - "今日は歴史がなかったので、"
      - "スナップショットできません"
      - "履歴は監査ログから来る"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "フィールドの表示ラベルを設定する場所?"
    options:
      - "各ウィジェット"
      - "データセットのフィールドメタデータでは、すべてのレンズとウィジェットがそれを継承する"
      - "レシピの式で"
      - "アプリの設定"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "すべてのダッシュボードに6つの小数点の通貨測定が表示されます。 効率的な修正は:"
    options:
      - "各ウィジェットのフォーマット"
      - "データセットフィールドに一度フォーマットを設定する"
      - "ラウンドで SAQL"
      - "チャートタイプを変更する"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "608のチャンスを1,192の商品ラインが1,192の列に加わりました。 バグは:"
    options:
      - "参加する"
      - "親の額を後ろにまとめると、行ごとに繰り返す"
      - "内部ではなくルックアップを使う"
      - "バグはありません"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "製品レベルの細部を保つ修正は次のとおりです。"
    options:
      - "参加前にラインアイテムを集計"
      - "親の額ではなく、ラインの穀物と合計のLineAmountを保ちます"
      - "取引ごとの1つのプロダクトへのフィルター"
      - "内部の結合を使用して下さい"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "データセットの穀物は以下から得られるはずです。"
    options:
      - "ソーステーブル"
      - "答えなければならない最高の質問"
      - "チャートの種類"
      - "行の制限"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "18ヶ月のスナップショットのすべての行を渡るARRを召喚する:"
    options:
      - "会社案内"
      - "ほとんど 18 年 の 収入"
      - "アカウントごとのALR"
      - "エラー"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "今日の同期を開始するフィールドは次のとおりです。"
    options:
      - "バックフィルドの歴史"
      - "今日、永久に歴史なし"
      - "監査証跡からの歴史"
      - "次の再建後の歴史"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "アカウントのような参照テーブルの列をまとめる:"
    options:
      - "標準練習"
      - "通常は間違い — 参照テーブルが結合されず、集計されていない"
      - "ARRに必要な"
      - "実際のテーブルよりも高速"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "長いフォーマットの特徴的な失敗はあります:"
    options:
      - "スロークエリ"
      - "1つのメトリクスにフィルターを忘れるクエリ、無関係のメトリクスをサイレントにまとめる"
      - "ミスキー"
      - "重複組織"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "総生成のデフォルト集計で利用割合フィールド:"
    options:
      - "正しい合計"
      - "年間で960%、きれいにレンダリングされる"
      - "エラー"
      - "ニュルス"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "データセット内で適用されるフィルタは、次のように記述します。"
    options:
      - "お問い合わせ"
      - "それは目に見えない下流です、従って源に対する調整は目に見える原因と異なりません"
      - "それは性能に影響を与えます"
      - "視聴者が変更したい"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "データセットの記述の最も有用な単一文は次のとおりです。"
    options:
      - "誰が構築したか"
      - "1列が表現するもの"
      - "リフレッシュするとき"
      - "どのアプリなのか"
    answer: 1
    topic: "datasets-and-modelling"
---

データレイヤードメインの質問 CRM Analytics そして、 Einstein Discovery コンサルタント試験
