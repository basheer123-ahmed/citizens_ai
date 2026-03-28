import base64
with open(r"C:\Users\K\.gemini\antigravity\brain\a672c7d7-c932-48fa-b0cd-38342e026d79\police_department_emblem_1774725335694.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

javascript_code = f"export const policeEmblemBase64 = 'data:image/png;base64,{encoded_string}';"
with open(r"c:\Users\K\Desktop\CGMP ATP\CGMP\frontend\src\assets\policeEmblemBase64.js", "w") as out_file:
    out_file.write(javascript_code)
