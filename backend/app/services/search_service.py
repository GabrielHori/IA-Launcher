from duckduckgo_search import DDGS

class SearchService:
    def search_web(self, query: str, max_results: int = 5):
        """Recherche sur le web et retourne un condensé des résultats."""
        try:
            with DDGS() as ddgs:
                results = [r for r in ddgs.text(query, max_results=max_results)]
                if not results:
                    return "Aucun résultat trouvé sur le web."
                
                # Formatage des résultats pour l'IA
                context = "\n--- RÉSULTATS WEB ---\n"
                for r in results:
                    context += f"Titre: {r['title']}\nLien: {r['href']}\nExtrait: {r['body']}\n\n"
                return context
        except Exception as e:
            print(f"Erreur de recherche: {e}")
            return "Impossible d'accéder aux données web pour le moment."

search_service = SearchService()