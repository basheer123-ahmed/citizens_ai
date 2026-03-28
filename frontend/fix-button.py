import sys
import os
import re

filepath = 'src/components/ComplaintForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Highly flexible regex to catch anything starting with <button ... onClick={startListening}
# and ending with </button>
target_pattern = r'<\s*button[\s\S]*?onClick\s*=\s*\{\s*startListening\s*\}[\s\S]*?<\s*/\s*button\s*>'
replacement = """<button
                   type="button"
                   onClick={isListening ? stopMic : startMic}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/20' : 'bg-slate-100 text-primary-500 hover:bg-primary-500 hover:text-white'}`}
                 >
                   {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                   {isListening ? 'Recording Intel...' : 'Neural Voice Input'}
                 </button>"""

if re.search(target_pattern, content):
    print("Found the target button. Replacing...")
    new_content = re.sub(target_pattern, replacement, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replace successful.")
else:
    print("Did not find the button with the expected pattern.")
