"""
CSVログを読み込むモジュール
Attack Atlas MVP Step2
"""

import pandas as pd


def parse_csv(file_content: bytes):
    """
    アップロードされたCSVファイルをDataFrameとして読み込む。

    Parameters
    ----------
    file_content : bytes
        Reactから送られてきたCSVファイル

    Returns
    -------
    list
        イベント一覧(JSON化できる形式)
    """

    # bytes → DataFrame
    from io import BytesIO

    df = pd.read_csv(BytesIO(file_content))

    # 最初の10件だけ返す（MVPなので）
    events = df.head(10).to_dict(orient="records")

    return events
