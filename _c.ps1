$d="C:\Users\jevon\mybridge-site"; $enc=[Text.UTF8Encoding]::new($false)
function Sub-Text($f,$a,$b){ $p="$d\$f"; $t=[IO.File]::ReadAllText($p,$enc); if($t.Contains($a)){ [IO.File]::WriteAllText($p,$t.Replace($a,$b),$enc); "OK  $f" } else { "MISS $f :: $($a.Substring(0,[Math]::Min(55,$a.Length)))" } }
# consent bar: honor hidden attribute
Sub-Text "styles.css" '.consent p{margin:0}' '.consent[hidden]{display:none}
.consent p{margin:0}'
# trust deed: rate range, cut points line
$f="trust-deed-investing.html"
Sub-Text $f 'MyBridge Loans prices 1st trust deeds at 9.5% to 10.99% and up and 2nd trust deeds at 11.99% to 12.99% and up. The investor''s yield on any specific loan is stated in writing before funding and depends on the loan, the lien position, and the servicing arrangement. Points at origination are separate from the note rate.' 'MyBridge Loans prices 1st and 2nd trust deeds anywhere from 9.5% to 13.99% depending on risk. The investor''s yield on any specific loan is stated in writing before funding and depends on the loan, the lien position, and the servicing arrangement.'
Sub-Text $f 'MyBridge Loans prices 1st trust deeds at 9.5% to 10.99% and up and 2nd trust deeds at 11.99% to 12.99% and up. The investor''s yield depends on the loan and the servicing arrangement, and is stated in writing before funding.' 'MyBridge Loans prices 1st and 2nd trust deeds anywhere from 9.5% to 13.99% depending on risk. The investor''s yield depends on the loan and the servicing arrangement, and is stated in writing before funding.'
# trust deed: risks
Sub-Text $f 'On a 2nd trust deed, a senior lien that forecloses can wipe out the junior position if there is not enough equity.' 'On a 2nd trust deed, a senior lien that forecloses can wipe out the junior position if there is not enough equity or the 2nd trust deed holder does not have notices and processes in place to act in time to remedy.'
cd $d; $x=[IO.File]::ReadAllText("$d\$f"); $m=[regex]::Match($x,'(?s)<script type="application/ld\+json">(.*?)</script>'); try{$null=$m.Groups[1].Value|ConvertFrom-Json; "schema ok"}catch{"schema INVALID"}
(Select-String -Path $f -Pattern '10\.99|12\.99|Points at origination' | Measure-Object).Count
git add -A; git commit -q -m "Fix consent bar not hiding on Accept; trust deed rate range 9.5-13.99%, drop points line, expand 2nd TD risk wording

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01KoZdXCyEjqopVnNgHCNKQQ"; git push origin main 2>&1 | Select-String -Pattern "main -> main|error|fatal|rejected"; Write-Output "===EXIT $LASTEXITCODE==="
