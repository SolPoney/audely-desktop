"""
Scraper Cochlear — télécharge les PDFs d'exercices auditifs
Usage : python3 scripts/scrape_cochlear.py
"""

import requests
from bs4 import BeautifulSoup
from pathlib import Path
import time
import re

URL = "https://www.cochlear.com/ca/fr/home/ongoing-care-and-support/rehabilitation-resources/resources-for-adults/auditory-training-exercises"
OUTPUT_DIR = Path(__file__).parent.parent / "docs" / "exercices_cochlear"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "fr-CA,fr;q=0.9",
}

def nettoyer_nom(texte):
    texte = texte.strip().replace("/", "-").replace("\\", "-")
    texte = re.sub(r'[<>:"|?*]', '', texte)
    texte = re.sub(r'\s+', '_', texte)
    return texte[:80]

def scrape_and_download():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Téléchargement de la page…")
    res = requests.get(URL, headers=HEADERS, timeout=15)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "html.parser")

    # Extraire les liens de téléchargement avec leur contexte (label du paragraphe précédent)
    pdf_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "assets.cochlear.com" in href and "Télécharger" in a.get_text(strip=True):
            # Chercher le nom de l'exercice dans les éléments précédents
            label = ""
            parent = a.find_parent()
            while parent and not label:
                # Chercher le texte dans les éléments frères précédents
                for sib in parent.find_all_previous(string=True):
                    txt = sib.strip()
                    if txt and txt != "Télécharger" and len(txt) > 3:
                        label = txt
                        break
                parent = parent.find_parent()
            pdf_links.append((label or f"exercice_{len(pdf_links)+1}", href))

    print(f"{len(pdf_links)} fichier(s) trouvé(s)\n")

    for i, (label, url) in enumerate(pdf_links, 1):
        nom = f"{i:02d}_{nettoyer_nom(label)}.pdf"
        dest = OUTPUT_DIR / nom
        print(f"  {i:2d}. {label}")
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            dest.write_bytes(r.content)
            taille = len(r.content) // 1024
            print(f"      ✓ {nom} ({taille} Ko)")
        except Exception as e:
            print(f"      ✗ Erreur : {e}")
        time.sleep(0.4)

    print(f"\nTous les fichiers sont dans : {OUTPUT_DIR}")

if __name__ == "__main__":
    scrape_and_download()
