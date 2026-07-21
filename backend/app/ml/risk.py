from app.models import RiskLevel


def get_risk(probability: float, prediction: bool) -> RiskLevel:
    """
    Returns the disease risk level.

    Parameters
    ----------
    probability
        Confidence returned by the classifier (0–100).

    prediction
        True  -> Disease predicted
        False -> No disease predicted
    """

    # If the model predicts "No Disease",
    # convert confidence into disease risk.
    if not prediction:
        probability = 100 - probability

    if probability < 30:
        return RiskLevel.LOW

    elif probability < 60:
        return RiskLevel.MODERATE

    elif probability < 85:
        return RiskLevel.HIGH

    else:
        return RiskLevel.CRITICAL