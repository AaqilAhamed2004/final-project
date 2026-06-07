%% ============================================================
%% AURA — Medicine Knowledge Base
%% File: medicine_kb.pl
%%
%% Encodes safe medicine substitutions for when an item is out
%% of stock. This is the "expert system" knowledge base.
%%
%% Predicates:
%%   substitute(+Requested, -Substitute, -Reason)
%%   no_substitute(+Drug)
%%   get_substitute(+Drug, -Result)
%% ============================================================


%% ─── Substitution Facts ─────────────────────────────────────
%% Each fact: substitute(requested_drug, substitute_drug, reason).
%% Drug names use underscores, all lowercase — must match prolog_item_key
%% values stored in MongoDB inventory documents.

substitute(paracetamol, ibuprofen,
    "Ibuprofen reduces fever and pain similarly. Avoid in children under 6 months.").

substitute(ibuprofen, paracetamol,
    "Paracetamol is safer for children and those with stomach sensitivity.").

substitute(amoxicillin, ampicillin,
    "Ampicillin covers a similar spectrum of bacterial infections.").

substitute(ampicillin, amoxicillin,
    "Amoxicillin is better absorbed orally and has similar coverage.").

substitute(oral_rehydration_salts, coconut_water,
    "Emergency hydration alternative. Also prepare home ORS: 1L water, 6 tsp sugar, 0.5 tsp salt.").

substitute(metronidazole, tinidazole,
    "Tinidazole is effective against similar anaerobic and parasitic infections.").

substitute(chloroquine, artemether,
    "Artemether-based therapy is recommended for malaria in Sri Lanka where resistance is present.").

substitute(cetirizine, loratadine,
    "Loratadine is a non-drowsy antihistamine effective for similar allergy symptoms.").

substitute(omeprazole, ranitidine,
    "Ranitidine reduces stomach acid through a different mechanism but is a viable short-term substitute.").


%% ─── No Substitute (critical drugs) ────────────────────────
%% These drugs have NO safe alternative — must be sourced urgently.

no_substitute(insulin).
no_substitute(epinephrine).
no_substitute(morphine).
no_substitute(warfarin).


%% ─── Combined Query Rule ────────────────────────────────────
%% get_substitute(+Drug, -Result)
%%   Returns result(Substitute, Reason) if a substitute exists.
%%   Returns no_substitute(Drug) if the drug is critical or unknown.

get_substitute(Drug, result(Substitute, Reason)) :-
    substitute(Drug, Substitute, Reason), !.

get_substitute(Drug, no_substitute(Drug)) :-
    no_substitute(Drug), !.

get_substitute(Drug, no_substitute(Drug)) :-
    \+ substitute(Drug, _, _), !.


%% ─── TEST QUERIES ────────────────────────────────────────────
%% ?- get_substitute(paracetamol, R).
%%    Expected: R = result(ibuprofen, "Ibuprofen reduces...").
%% ?- get_substitute(insulin, R).
%%    Expected: R = no_substitute(insulin).
%% ?- get_substitute(unknown_drug, R).
%%    Expected: R = no_substitute(unknown_drug).
%% ?- halt.