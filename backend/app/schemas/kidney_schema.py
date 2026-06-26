from pydantic import BaseModel


class KidneyRequest(BaseModel):

    Bp: float
    Sg: float
    Al: float
    Su: float
    Rbc: float
    Bu: float
    Sc: float
    Sod: float
    Pot: float
    Hemo: float
    Wbcc: float
    Rbcc: float
    Htn: float